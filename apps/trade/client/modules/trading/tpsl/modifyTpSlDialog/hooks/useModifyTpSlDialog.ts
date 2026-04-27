import { asyncResult, removeDecimals } from '@nadohq/client';
import { useExecuteCancelOrders } from 'client/hooks/execute/cancelOrder/useExecuteCancelOrders';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useLatestOrderFill } from 'client/hooks/markets/useLatestOrderFill';
import {
  RUN_WITH_DELAY_DURATIONS,
  useRunWithDelayOnCondition,
} from 'client/hooks/util/useRunWithDelayOnCondition';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { MARKET_ORDER_EXECUTION_TYPE } from 'client/modules/trading/consts/marketOrderExecutionType';
import { TpSlOrderFormInitialValues } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { useTpSlOrderForm } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/useTpSlOrderForm';
import { useTpSlPositionData } from 'client/modules/trading/tpsl/hooks/useTpSlPositionData';
import { ModifyTpSlDialogParams } from 'client/modules/trading/tpsl/modifyTpSlDialog/types';
import { isTpSlMaxOrderSize } from 'client/modules/trading/tpsl/utils/isTpSlMaxOrderSize';
import { requirePriceTriggerCriteria } from 'client/modules/trading/utils/trigger/getPriceTriggerCriteria';
import { getTriggerOrderDisplayType } from 'client/modules/trading/utils/trigger/getTriggerOrderDisplayType';
import { getTriggerReferencePriceType } from 'client/modules/trading/utils/trigger/getTriggerReferencePriceType';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useModifyTpSlDialog({
  productId,
  order,
  isIso,
}: ModifyTpSlDialogParams) {
  const { t } = useTranslation();

  const { goBack } = useDialog();
  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const { data: latestOrderFillPrice } = useLatestOrderFill({ productId });
  const { mutateAsync: cancelOrders, status: cancelStatus } =
    useExecuteCancelOrders();
  const { dispatchNotification } = useNotificationManagerContext();
  const positionData = useTpSlPositionData({ productId, isIso });

  const staticMarketData = allMarketsStaticData?.allMarkets[productId];

  const orderDisplayType = getTriggerOrderDisplayType(order);
  const isTakeProfit = orderDisplayType === 'take_profit';

  // Initial form values derived from the existing order
  // Only override values that differ from defaults - the rest are merged in useTpSlOrderForm
  const initialValues = useMemo((): TpSlOrderFormInitialValues => {
    const priceTriggerCriteria = requirePriceTriggerCriteria(
      order.order.triggerCriteria,
    );
    const isMarketOrder =
      order.order.appendix.orderExecutionType === MARKET_ORDER_EXECUTION_TYPE;
    const orderAmount = removeDecimals(order.order.amount);
    const isEntirePosition = isTpSlMaxOrderSize(orderAmount);

    const priceValues: TpSlOrderFormInitialValues['tp'] = {
      triggerPrice: priceTriggerCriteria.triggerPrice.toString(),
      triggerReferencePriceType:
        getTriggerReferencePriceType(priceTriggerCriteria),
      isLimitOrder: !isMarketOrder,
      limitPrice: isMarketOrder ? undefined : order.order.price.toString(),
    };

    return {
      tp: isTakeProfit ? priceValues : undefined,
      sl: isTakeProfit ? undefined : priceValues,
      isPartialOrder: !isEntirePosition,
      amount: isEntirePosition ? undefined : orderAmount.abs().toString(),
    };
  }, [order, isTakeProfit]);

  const tpSlFormData = useTpSlOrderForm({
    isIso,
    positionAmount: positionData?.amount,
    positionNetEntry: positionData?.netEntryCost,
    isoNetMarginTransferred: positionData?.isoNetMarginTransferred,
    marketData: staticMarketData,
    initialValues,
  });

  const dialogTitle = isTakeProfit
    ? t(($) => $.dialogTitles.modifyTp)
    : t(($) => $.dialogTitles.modifySl);
  const priceState = isTakeProfit ? tpSlFormData.tpState : tpSlFormData.slState;

  const onFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      // Since we're not using RHF's handleSubmit, we need to prevent default manually
      e.preventDefault();

      // First cancel the existing order (silent on success, notify on error)
      const serverExecutionResult = cancelOrders({
        orders: [
          {
            productId,
            digest: order.order.digest,
            isTrigger: true,
          },
        ],
      });

      const [, error] = await asyncResult(serverExecutionResult);

      if (error) {
        dispatchNotification({
          type: 'action_error_handler',
          data: {
            errorNotificationTitle: t(($) => $.errors.failedToCancelOrder),
            executionData: {
              serverExecutionResult,
            },
          },
        });
        return;
      }

      // Then submit the new order
      tpSlFormData.onFormSubmit();
    },
    [
      cancelOrders,
      dispatchNotification,
      order.order.digest,
      productId,
      t,
      tpSlFormData,
    ],
  );

  const buttonState = ((): BaseActionButtonState => {
    if (cancelStatus === 'pending' || tpSlFormData.isSubmitting) {
      return 'loading';
    }
    if (tpSlFormData.isSuccess) {
      return 'success';
    }

    const hasFormError =
      !!priceState.formError || !!tpSlFormData.amountState.amountFormError;

    const isFormValid =
      !hasFormError &&
      priceState.hasRequiredValues &&
      tpSlFormData.amountState.hasRequiredValues;

    return isFormValid ? 'idle' : 'disabled';
  })();

  useRunWithDelayOnCondition({
    condition: tpSlFormData.isSuccess,
    fn: goBack,
    delay: RUN_WITH_DELAY_DURATIONS.SHORT,
  });

  return {
    ...tpSlFormData,
    priceState,
    isTakeProfit,
    lastPrice: latestOrderFillPrice?.price,
    staticMarketData,
    positionData,
    buttonState,
    dialogTitle,
    onFormSubmit,
  };
}
