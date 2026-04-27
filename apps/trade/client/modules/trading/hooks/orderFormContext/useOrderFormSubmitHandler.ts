import {
  addDecimals,
  BigNumbers,
  EngineServerExecuteSuccessResult,
  PriceTriggerRequirementType,
  ProductEngineType,
  QUOTE_PRODUCT_ID,
  sumBigNumberBy,
  toBigNumber,
  toPrintableObject,
  TriggerServerExecuteSuccessResult,
} from '@nadohq/client';
import {
  calcIsoOrderRequiredMargin,
  calcMarketConversionPriceFromOraclePrice,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import {
  ExecuteMultiLimitOrderParams,
  ExecutePlaceEngineOrderParams,
  ExecutePlaceOrderCommonParams,
  ExecutePlaceOrderIsolatedParams,
  ExecutePlaceOrderParams,
  ExecutePlacePriceTriggerOrderParams,
  ExecutePlaceTimeTriggerOrderParams,
} from 'client/hooks/execute/placeOrder/types';
import { useExecutePlaceOrder } from 'client/hooks/execute/placeOrder/useExecutePlaceOrder';
import { StaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { useQueryLatestOraclePrices } from 'client/hooks/query/markets/useQueryLatestOraclePrices';
import { useSyncedRef } from 'client/hooks/util/useSyncedRef';
import { MarginMode } from 'client/modules/localstorage/userState/types/tradingSettings';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { TWAP_RANDOMNESS_FRACTION } from 'client/modules/trading/components/twap/consts';
import {
  calcTwapNumberOfOrders,
  getTwapOrderAmounts,
} from 'client/modules/trading/components/twap/utils';
import { useOrderSlippageSettings } from 'client/modules/trading/hooks/useOrderSlippageSettings';
import {
  TpSlOrderFormValues,
  TpSlSubmitHandlerValues,
} from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import {
  OrderFormValues,
  RoundAmountFn,
  RoundPriceFn,
} from 'client/modules/trading/types/orderFormTypes';
import { convertOrderSizeToAssetAmount } from 'client/modules/trading/utils/orderSizeConversions';
import {
  buildScaledOrders,
  BuildScaledOrdersIsoParams,
} from 'client/modules/trading/utils/scaledOrderUtils';
import { first, merge } from 'lodash';
import { RefObject, useCallback } from 'react';

interface BaseParams {
  mutateAsync: ReturnType<typeof useExecutePlaceOrder>['mutateAsync'];
  // Used for isolated engine orders.
  inputConversionPriceRef: RefObject<BigNumber | undefined>;
  // Used as the actual "price" field of an engine order.
  executionConversionPriceRef: RefObject<BigNumber | undefined>;
  currentMarket: StaticMarketData | undefined;
  quoteProductId: number | undefined;
  roundPrice: RoundPriceFn;
  roundAssetAmount: RoundAmountFn;
}

interface SpotParams {
  spotLeverageEnabled: boolean;
  marginMode?: never;
  tpsl?: never;
  iso?: never;
}

export interface OrderFormSubmitHandlerIsoParams {
  // The subaccount name of the isolated subaccount, undefined if there isn't an existing isolated position
  subaccountName: string | undefined;
  isReducingIsoPosition: boolean;
}

export interface OrderFromSubmitHandlerTpSlParams {
  formValues: TpSlOrderFormValues;
  submitHandler: (data: TpSlSubmitHandlerValues) => void;
}

interface PerpParams {
  spotLeverageEnabled?: never;
  marginMode: MarginMode;
  tpsl: OrderFromSubmitHandlerTpSlParams | undefined;
  iso: OrderFormSubmitHandlerIsoParams | undefined;
}

type Params = BaseParams & (SpotParams | PerpParams);

export function useOrderFormSubmitHandler({
  currentMarket,
  quoteProductId,
  inputConversionPriceRef,
  executionConversionPriceRef,
  mutateAsync,
  spotLeverageEnabled,
  tpsl,
  marginMode,
  iso,
  roundPrice,
  roundAssetAmount,
}: Params) {
  const { dispatchNotification } = useNotificationManagerContext();
  const { data: latestOraclePrices } = useQueryLatestOraclePrices();
  const latestOraclePricesRef = useSyncedRef(latestOraclePrices);
  const {
    savedSettings: { market: marketSlippageFraction },
  } = useOrderSlippageSettings();

  // Destructure for stable dependencies in useCallback
  const {
    mode: marginModeType,
    leverage: marginModeLeverage,
    enableBorrows: marginModeEnableBorrows,
  } = marginMode ?? {};
  const { isReducingIsoPosition } = iso ?? {};

  return useCallback(
    (formValues: OrderFormValues) => {
      const executionConversionPrice = executionConversionPriceRef.current;
      const inputConversionPrice = inputConversionPriceRef.current;

      if (
        !currentMarket ||
        !formValues.size ||
        !executionConversionPrice ||
        !inputConversionPrice
      ) {
        console.warn(
          '[useOrderFormSubmitHandler] Skipping order placement, missing/invalid data.',
          toPrintableObject({
            inputConversionPrice,
            executionConversionPrice,
            currentMarket,
            formValues,
          }),
        );
        return;
      }

      const marketData = (() => {
        if (currentMarket.type === ProductEngineType.SPOT) {
          return currentMarket.metadata.token;
        }
        return currentMarket.metadata;
      })();

      const orderAmount = convertOrderSizeToAssetAmount({
        size: toBigNumber(formValues.size),
        sizeDenom: formValues.sizeDenom,
        conversionPrice: inputConversionPrice,
        roundAssetAmount,
      });

      if (!orderAmount) {
        console.warn(
          '[useOrderFormSubmitHandler] Skipping order placement, missing/invalid data.',
          toPrintableObject({
            orderAmount,
          }),
        );
        return;
      }

      const orderAmountWithSign = orderAmount.multipliedBy(
        formValues.side === 'long' ? 1 : -1,
      );
      const decimalAdjustedAmount = addDecimals(orderAmountWithSign);

      const timeInForceInDays = formValues.orderSettings.timeInForceInDays
        ? toBigNumber(formValues.orderSettings.timeInForceInDays)
        : undefined;

      const spotLeverage = (() => {
        if (currentMarket.type !== ProductEngineType.SPOT) {
          return;
        }
        // Default to no leverage
        return spotLeverageEnabled ?? false;
      })();

      const isolatedParams: ExecutePlaceOrderIsolatedParams | undefined =
        (() => {
          if (
            marginModeLeverage &&
            marginModeType === 'isolated' &&
            // This is needed to access max leverage
            currentMarket.type === ProductEngineType.PERP
          ) {
            const borrowMargin = (() => {
              if (isReducingIsoPosition) {
                return false;
              }
              return marginModeEnableBorrows ?? false;
            })();

            return {
              margin: calcIsoOrderRequiredMargin({
                isMarketOrder: formValues.orderType === 'market',
                leverage: marginModeLeverage,
                marketMaxLeverage: currentMarket.maxLeverage,
                assetAmountWithSign: decimalAdjustedAmount,
                orderPrice: inputConversionPrice,
                oraclePrice:
                  latestOraclePricesRef.current?.[currentMarket.productId]
                    ?.oraclePrice,
                isReducingIsoPosition,
              }),
              borrowMargin,
            };
          }
        })();

      let mutationParams: ExecutePlaceOrderParams;
      const commonOrderParams: ExecutePlaceOrderCommonParams = {
        productId: currentMarket.productId,
        price: executionConversionPrice,
        amount: decimalAdjustedAmount,
        spotLeverage,
        timeInForceType: formValues.orderSettings.timeInForceType,
        timeInForceInDays,
        postOnly: formValues.orderSettings.postOnly,
        reduceOnly: formValues.orderSettings.reduceOnly,
        iso: isolatedParams,
      };

      switch (formValues.orderType) {
        case 'market':
        case 'limit': {
          const engineParams: ExecutePlaceEngineOrderParams = {
            orderType: formValues.orderType,
            ...commonOrderParams,
          };
          mutationParams = engineParams;
          break;
        }
        case 'stop_market':
        case 'stop_limit':
          {
            if (quoteProductId == null) {
              console.warn(
                '[useOrderFormSubmitHandler] Skipping stop order placement, missing quote product ID',
              );
              return;
            }

            const triggerPrice = toBigNumber(formValues.triggerPrice);

            // Avoid placing bad stop orders by deriving trigger condition from latest oracle prices
            const baseOraclePrice =
              latestOraclePricesRef.current?.[currentMarket.productId]
                ?.oraclePrice;
            const quoteOraclePrice =
              quoteProductId === QUOTE_PRODUCT_ID
                ? BigNumbers.ONE
                : latestOraclePricesRef.current?.[quoteProductId]?.oraclePrice;

            if (
              !baseOraclePrice ||
              !quoteOraclePrice ||
              baseOraclePrice.isZero() ||
              quoteOraclePrice.isZero()
            ) {
              console.warn(
                '[useOrderFormSubmitHandler] Skipping stop order placement, missing/invalid price data.',
                toPrintableObject({
                  triggerPrice,
                  baseOraclePrice,
                  quoteOraclePrice,
                }),
              );
              return;
            }

            const oracleConversionPrice =
              calcMarketConversionPriceFromOraclePrice(
                baseOraclePrice,
                quoteOraclePrice,
              );

            // Backend trigger service uses oracle price to determine when to send orders to engine, so do the same check here
            // If trigger > oracle, then we want the order to trigger when oracle rises above the trigger price, and vice versa
            const priceTriggerRequirementType: PriceTriggerRequirementType =
              triggerPrice.gt(oracleConversionPrice)
                ? 'oracle_price_above'
                : 'oracle_price_below';

            // Create a new const for IDE autocompletion
            const triggerParams: ExecutePlacePriceTriggerOrderParams = {
              ...commonOrderParams,
              orderType: formValues.orderType,
              priceTriggerCriteria: {
                type: priceTriggerRequirementType,
                triggerPrice,
              },
            };
            mutationParams = triggerParams;
          }
          break;
        case 'twap':
          {
            const {
              isRandomOrder,
              durationHours,
              durationMinutes,
              frequencyInSeconds,
            } = formValues.twapOrder;

            const numberOfOrders = calcTwapNumberOfOrders(
              {
                hours: durationHours,
                minutes: durationMinutes,
              },
              frequencyInSeconds,
            );

            const amounts = getTwapOrderAmounts({
              numberOfOrders,
              // We need to use orderAmountWithSign as roundAssetAmount only works with input amounts, not decimal adjusted amounts
              orderAssetAmount: orderAmountWithSign,
              roundAssetAmount,
              randomnessFraction: isRandomOrder ? TWAP_RANDOMNESS_FRACTION : 0,
              sizeIncrement: currentMarket.sizeIncrement,
            }).map((amt) => addDecimals(amt));

            const twapParams: ExecutePlaceTimeTriggerOrderParams = {
              orderType: formValues.orderType,
              ...commonOrderParams,
              // Use the sum of the rounded suborder amounts as the total.
              // This ensures the total matches the actual suborders to avoid backend rejections.
              amount: sumBigNumberBy(amounts, (amt) => amt),
              // For TWAP orders, use an high price to ensure execution:
              // - Long: set price very high (upper bound)
              // - Short: set price to 0 (lower bound)
              price:
                formValues.side === 'long'
                  ? executionConversionPrice.times(1000)
                  : BigNumbers.ZERO,
              triggerCriteria: {
                interval: frequencyInSeconds,
                amounts,
              },
              numberOfOrders,
              slippageFraction: marketSlippageFraction,
            };
            mutationParams = twapParams;
          }
          break;
        case 'multi_limit': {
          const {
            numberOfOrders,
            priceDistributionType,
            sizeDistributionType,
            startPrice,
            endPrice,
          } = formValues.scaledOrder;

          // For isolated positions, calculate isolated margin per suborder.
          // marginModeLeverage is always defined when isolated, but TS can't infer
          // that from the conditional alone - hence `&& marginModeLeverage` for type narrowing.
          const scaledOrderIsoParams: BuildScaledOrdersIsoParams | undefined =
            marginModeType === 'isolated' &&
            marginModeLeverage &&
            currentMarket.type === ProductEngineType.PERP
              ? {
                  leverage: marginModeLeverage,
                  borrowMargin: isolatedParams?.borrowMargin ?? false,
                  isReducingIsoPosition: isReducingIsoPosition ?? false,
                  marketMaxLeverage: currentMarket.maxLeverage,
                }
              : undefined;

          const orders = buildScaledOrders({
            startPrice,
            endPrice,
            // We need to use orderAmountWithSign as roundAssetAmount only works with input amounts, not decimal adjusted amounts
            orderAssetAmount: orderAmountWithSign,
            numberOfOrders,
            priceDistributionType,
            sizeDistributionType,
            roundPrice,
            roundAssetAmount,
            iso: scaledOrderIsoParams,
          });

          const decimalAdjustedOrders = orders?.map((order) => ({
            ...order,
            amount: addDecimals(order.amount),
            iso: order.iso
              ? {
                  ...order.iso,
                  margin: addDecimals(order.iso.margin),
                }
              : undefined,
          }));

          if (!decimalAdjustedOrders) {
            console.warn(
              '[useOrderFormSubmitHandler] Skipping scaled order placement, missing/invalid data.',
              toPrintableObject({
                decimalAdjustedOrders,
                formValues,
              }),
            );
            return;
          }

          const scaledOrderParams: ExecuteMultiLimitOrderParams = {
            orderType: formValues.orderType,
            ...commonOrderParams,
            orders: decimalAdjustedOrders,
          };

          mutationParams = scaledOrderParams;
          break;
        }
      }

      console.log(
        '[useOrderFormSubmitHandler] Place order mutation params',
        toPrintableObject(mutationParams),
      );

      const orderActionResult = mutateAsync(mutationParams, {
        async onSuccess(
          result:
            | EngineServerExecuteSuccessResult<'place_orders'>
            | TriggerServerExecuteSuccessResult<'place_orders'>,
        ) {
          // We just want to place the TPSL for the first order digest from the result
          const firstOrder = first(result.data);

          if (!firstOrder?.digest || !tpsl) {
            return;
          }

          // Provide `orderDigest` as a dependency for the TP/SL orders only if we place a limit order
          // We don't want to do this for market orders as they will fill immediately, and our auto-cancel handler
          // ignores TPSL orders with a dependency, so for proper cleanup of these TPSLs, it's better to not have a dependency
          const isLimitOrder = mutationParams.orderType === 'limit';
          // Submit TPSL orders with an amount equal to the main engine order
          // We must set isPartialOrder with amount and amountFraction, otherwise
          // TPSL_MAX_ORDER_SIZE_WITH_DECIMALS will be used instead
          const tpSlFormOverrides: Partial<TpSlSubmitHandlerValues> = {
            isPartialOrder: true,
            amount: orderAmount.toString(),
            amountFraction: 1,
            orderDigest: isLimitOrder ? firstOrder.digest : undefined,
          };
          const tpslSubmitValues = merge<
            TpSlOrderFormValues,
            Partial<TpSlSubmitHandlerValues>
          >(tpsl.formValues, tpSlFormOverrides);

          console.log(
            '[useOrderFormSubmitHandler] Main order success, placing TP/SL',
            toPrintableObject(tpslSubmitValues),
          );

          tpsl.submitHandler(tpslSubmitValues);
        },
      });

      dispatchNotification({
        type: 'place_order',
        data: {
          placeOrderParams: mutationParams,
          metadata: {
            icon: marketData.icon,
            symbol: marketData.symbol,
            marketName: currentMarket.metadata.marketName,
            priceIncrement: currentMarket.priceIncrement,
            sizeIncrement: currentMarket.sizeIncrement,
          },
          orderMarketType: currentMarket.type,
          orderType: formValues.orderType,
          executeResult: orderActionResult,
        },
      });
    },
    [
      executionConversionPriceRef,
      inputConversionPriceRef,
      currentMarket,
      roundAssetAmount,
      mutateAsync,
      dispatchNotification,
      spotLeverageEnabled,
      marginModeType,
      marginModeLeverage,
      marginModeEnableBorrows,
      isReducingIsoPosition,
      latestOraclePricesRef,
      quoteProductId,
      marketSlippageFraction,
      roundPrice,
      tpsl,
    ],
  );
}
