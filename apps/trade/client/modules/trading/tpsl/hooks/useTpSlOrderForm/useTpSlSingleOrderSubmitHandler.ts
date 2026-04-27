import {
  addDecimals,
  BalanceSide,
  PriceTriggerDependency,
  PriceTriggerRequirementType,
  toBigNumber,
  toPrintableObject,
} from '@nadohq/client';
import { ExecutePlacePriceTriggerOrderParams } from 'client/hooks/execute/placeOrder/types';
import { useExecutePlaceOrder } from 'client/hooks/execute/placeOrder/useExecutePlaceOrder';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { useOrderSlippageSettings } from 'client/modules/trading/hooks/useOrderSlippageSettings';
import { TPSL_MAX_ORDER_SIZE_WITH_DECIMALS } from 'client/modules/trading/tpsl/consts';
import { TpSlSubmitHandlerValues } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { getOrderSlippageMultiplier } from 'client/modules/trading/utils/getOrderSlippageMultiplier';
import { roundToString } from 'client/utils/rounding';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface Params {
  isTakeProfit: boolean;
  isTriggerPriceAbove: boolean;
  productId: number | undefined;
  isIso: boolean;
  positionSide: BalanceSide | undefined;
  mutateAsync: ReturnType<typeof useExecutePlaceOrder>['mutateAsync'];
}

/**
 * Submit handler for either a take profit or stop loss order
 */
export function useTpSlSingleOrderSubmitHandler({
  productId,
  isIso,
  positionSide,
  mutateAsync,
  isTakeProfit,
  isTriggerPriceAbove,
}: Params) {
  const { t } = useTranslation();
  const { dispatchNotification } = useNotificationManagerContext();
  const {
    savedSettings: {
      takeProfit: tpSlippageFraction,
      stopLoss: slSlippageFraction,
    },
  } = useOrderSlippageSettings();

  const slippageFraction = isTakeProfit
    ? tpSlippageFraction
    : slSlippageFraction;

  return useCallback(
    async (values: TpSlSubmitHandlerValues) => {
      if (!productId || !positionSide) {
        return;
      }

      const priceValues = isTakeProfit ? values.tp : values.sl;

      const priceRequirementType: PriceTriggerRequirementType = (() => {
        switch (priceValues.triggerReferencePriceType) {
          case 'last_price':
            return isTriggerPriceAbove
              ? 'last_price_above'
              : 'last_price_below';
          case 'oracle_price':
            return isTriggerPriceAbove
              ? 'oracle_price_above'
              : 'oracle_price_below';
          case 'mid_price':
            return isTriggerPriceAbove ? 'mid_price_above' : 'mid_price_below';
        }
      })();

      const orderSizeWithDecimals = values.isPartialOrder
        ? addDecimals(values.amount)
        : TPSL_MAX_ORDER_SIZE_WITH_DECIMALS;
      const orderAmountWithDecimals =
        positionSide === 'short'
          ? orderSizeWithDecimals
          : orderSizeWithDecimals.negated();

      const triggerPrice = toBigNumber(priceValues.triggerPrice);

      const orderPrice = (() => {
        if (priceValues.isLimitOrder) {
          return toBigNumber(priceValues.limitPrice);
        }

        // If current order amount is positive, we're going to buy, so increase the price, & vice versa
        return triggerPrice.times(
          getOrderSlippageMultiplier(
            orderAmountWithDecimals.isPositive(),
            slippageFraction,
          ),
        );
      })();

      const dependency = ((): PriceTriggerDependency | undefined => {
        if (!values.orderDigest) {
          return;
        }
        return {
          digest: values.orderDigest,
          onPartialFill: true,
        };
      })();

      const mutationParams: ExecutePlacePriceTriggerOrderParams = {
        orderType: priceValues.isLimitOrder ? 'stop_limit' : 'stop_market',
        reduceOnly: true,
        price: orderPrice,
        amount: roundToString(orderAmountWithDecimals, 0),
        productId,
        iso: isIso
          ? {
              borrowMargin: false,
              margin: 0,
            }
          : undefined,
        priceTriggerCriteria: {
          triggerPrice,
          type: priceRequirementType,
          dependency,
        },
      };

      // Submit handler can be called when this specific TP / SL is not enabled (i.e. form not filled out).
      // no-op in this case to allow the other TP / SL to be submitted.
      if (!triggerPrice.isFinite() || !orderPrice.isFinite()) {
        console.debug(
          '[useTpSlSingleOrderFormSubmitHandler] Skipping trigger order submission. Invalid values:',
          toPrintableObject(mutationParams),
        );
        return;
      }

      const serverExecutionResult = mutateAsync(mutationParams);

      dispatchNotification({
        type: 'action_error_handler',
        data: {
          errorNotificationTitle: isTakeProfit
            ? t(($) => $.errors.placeTakeProfitAbbrevOrderFailed)
            : t(($) => $.errors.placeStopLossAbbrevOrderFailed),
          executionData: {
            serverExecutionResult,
          },
        },
      });

      return serverExecutionResult;
    },
    [
      productId,
      positionSide,
      isTakeProfit,
      isIso,
      mutateAsync,
      dispatchNotification,
      isTriggerPriceAbove,
      slippageFraction,
      t,
    ],
  );
}
