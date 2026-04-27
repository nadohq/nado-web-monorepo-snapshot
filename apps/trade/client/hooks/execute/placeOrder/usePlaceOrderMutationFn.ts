import {
  BigNumberish,
  EngineServerExecuteSuccessResult,
  getOrderNonce,
  millisToSeconds,
  NADO_PRODUCT_DECIMALS,
  OrderAppendix,
  OrderAppendixIsolatedFields,
  OrderExecutionType,
  packOrderAppendix,
  PlaceOrderParams,
  PlaceTriggerOrderParams,
  toBigNumber,
  toPrintableObject,
  TriggerServerExecuteSuccessResult,
} from '@nadohq/client';
import { nonNullFilter } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { ExecutePlaceOrderParams } from 'client/hooks/execute/placeOrder/types';
import { ValidExecuteContext } from 'client/hooks/execute/util/useExecuteInValidContext';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useGetRecvTime } from 'client/hooks/util/useGetRecvTime';
import { calculateTwapRuntimeInMillis } from 'client/modules/trading/components/twap/utils';
import { MARKET_ORDER_EXECUTION_TYPE } from 'client/modules/trading/consts/marketOrderExecutionType';
import { PlaceOrderExecuteResultError } from 'client/utils/errors/placeOrderExecuteResultError';
import { roundToIncrement, roundToString } from 'client/utils/rounding';
import { addDays, getTime } from 'date-fns';
import { useCallback } from 'react';

export function usePlaceOrderMutationFn() {
  const { data: marketDataByProductId } = useAllMarketsStaticData();
  const getRecvTime = useGetRecvTime();

  return useCallback(
    async (params: ExecutePlaceOrderParams, context: ValidExecuteContext) => {
      // Round amount & price
      const increments = marketDataByProductId?.allMarkets[params.productId];
      const roundedAmount = toMutationAmountInput(
        params.amount,
        increments?.sizeIncrement,
      );
      const roundedPrice = toMutationPriceInput(
        params.price,
        increments?.priceIncrement,
      );

      const nonce = getOrderNonce(await getRecvTime());
      const expirationTime = getOrderExpirationTimeInSeconds(params);
      // Order is common across engine & trigger
      const orderAppendix = getOrderAppendix(params);
      const order: PlaceOrderParams['order'] = {
        subaccountName: context.subaccount.name,
        subaccountOwner: context.subaccount.address,
        price: roundedPrice,
        amount: roundedAmount,
        expiration: expirationTime,
        appendix: packOrderAppendix(orderAppendix),
      };

      const sharedParams: PlaceTriggerOrderParams | PlaceOrderParams = {
        // Use a custom ID here to differentiate FE orders
        id: 1851876463,
        productId: params.productId,
        order,
        nonce,
        chainId: context.subaccount.chainId,
        spotLeverage: params.spotLeverage,
        borrowMargin: params.iso?.borrowMargin,
      };

      let result:
        | EngineServerExecuteSuccessResult<'place_orders'>
        | TriggerServerExecuteSuccessResult<'place_orders'>;

      switch (params.orderType) {
        case 'market':
        case 'limit': {
          const engineOrderParams: PlaceOrderParams = sharedParams;
          console.log(
            'Placing engine order',
            toPrintableObject(engineOrderParams),
            'Order appendix',
            toPrintableObject(orderAppendix),
          );
          result = await context.nadoClient.market.placeOrders({
            orders: [engineOrderParams],
          });
          break;
        }
        case 'multi_limit': {
          const multiLimitOrderParams: PlaceOrderParams[] = params.orders.map(
            (multiLimitOrder) => {
              // Fallback to parent productId if not provided, which is the case for scaled orders.
              const multiLimitProductId =
                multiLimitOrder.productId ?? sharedParams.productId;

              const multiLimitIncrements =
                marketDataByProductId?.allMarkets[multiLimitProductId];

              const multiLimitOrderAppendix = getOrderAppendix({
                ...params,
                iso: multiLimitOrder.iso ?? params.iso,
                productId: multiLimitProductId,
              });

              return {
                ...sharedParams,
                productId: multiLimitProductId,
                order: {
                  ...sharedParams.order,
                  price: toMutationPriceInput(
                    multiLimitOrder.price,
                    multiLimitIncrements?.priceIncrement,
                  ),
                  amount: toMutationAmountInput(
                    multiLimitOrder.amount,
                    multiLimitIncrements?.sizeIncrement,
                  ),
                  appendix: packOrderAppendix(multiLimitOrderAppendix),
                },
              };
            },
          );

          console.log(
            'Placing multi limit order',
            toPrintableObject(multiLimitOrderParams),
            'Order appendix',
            toPrintableObject(orderAppendix),
          );

          result = await context.nadoClient.market.placeOrders({
            orders: multiLimitOrderParams,
          });
          break;
        }
        case 'stop_market':
        case 'stop_limit': {
          const roundedTriggerPrice = toMutationPriceInput(
            params.priceTriggerCriteria.triggerPrice,
            increments?.priceIncrement,
          );

          const triggerOrderParams: PlaceTriggerOrderParams = {
            triggerCriteria: {
              type: 'price',
              criteria: {
                ...params.priceTriggerCriteria,
                triggerPrice: roundedTriggerPrice,
              },
            },
            ...sharedParams,
          };

          console.log(
            'Placing time trigger order',
            toPrintableObject(triggerOrderParams),
            'Order appendix',
            toPrintableObject(orderAppendix),
          );

          result = await context.nadoClient.market.placeTriggerOrders({
            orders: [triggerOrderParams],
          });
          break;
        }
        case 'twap': {
          result = await context.nadoClient.market.placeTriggerOrders({
            orders: [
              {
                ...sharedParams,
                triggerCriteria: {
                  type: 'time',
                  criteria: {
                    interval: params.triggerCriteria.interval,
                    amounts: params.triggerCriteria.amounts,
                  },
                },
              },
            ],
          });
          break;
        }
      }

      const errors = result.data
        .map((order) => order.error)
        .filter(nonNullFilter);

      if (errors.length) {
        // If any errors in result.data, throw an error.
        throw new PlaceOrderExecuteResultError(errors);
      }

      return result;
    },
    [getRecvTime, marketDataByProductId?.allMarkets],
  );
}

function getOrderAppendix(params: ExecutePlaceOrderParams): OrderAppendix {
  const orderExecutionType: OrderExecutionType = (() => {
    const { orderType, timeInForceType, postOnly } = params;

    switch (orderType) {
      case 'twap':
      case 'stop_market':
      case 'market':
        return MARKET_ORDER_EXECUTION_TYPE;
      case 'stop_limit':
        // Stop limit orders are always default orderExecutionType.
        return 'default';
      case 'multi_limit':
      case 'limit':
        // Limit & multi limit orders are default orderExecutionType if timeInForceType is not defined.
        switch (timeInForceType) {
          case 'gtc':
          case 'good_until':
            return postOnly ? 'post_only' : 'default';
          case 'fok':
            return 'fok';
          case 'ioc':
            return 'ioc';
          case undefined:
            return 'default';
        }
    }
  })();
  const isolatedFields: OrderAppendixIsolatedFields | undefined = params.iso
    ? {
        margin: toMutationAmountInput(params.iso.margin),
      }
    : undefined;

  switch (params.orderType) {
    case 'market':
    case 'limit':
    case 'multi_limit':
      return {
        orderExecutionType,
        reduceOnly: params.reduceOnly,
        isolated: isolatedFields,
      };
    case 'stop_market':
    case 'stop_limit':
      return {
        orderExecutionType,
        triggerType: 'price',
        reduceOnly: params.reduceOnly,
        isolated: isolatedFields,
      };
    case 'twap':
      return {
        orderExecutionType,
        triggerType: params.triggerCriteria.amounts
          ? 'twap_custom_amounts'
          : 'twap',
        reduceOnly: params.reduceOnly,
        isolated: isolatedFields,
        twap: {
          slippageFrac: params.slippageFraction,
          numOrders: params.numberOfOrders,
        },
      };
  }
}

function toMutationPriceInput(price: BigNumberish, increment?: BigNumber) {
  const roundedPrice = roundToIncrement(toBigNumber(price), increment);
  // Prevent "e-11" to improve parsing compatibility, as we have X18, the max decimal places we need to support is 18
  return roundToString(roundedPrice, NADO_PRODUCT_DECIMALS);
}

function toMutationAmountInput(amount: BigNumberish, increment?: BigNumber) {
  const roundedAmount = roundToIncrement(toBigNumber(amount), increment);
  return roundToString(roundedAmount, 0);
}

function getOrderExpirationTimeInSeconds(params: ExecutePlaceOrderParams) {
  const nowMillis = Date.now();

  switch (params.orderType) {
    case 'market':
    case 'stop_market':
    case 'stop_limit':
      // Market, stop market, and stop limit orders are infinite expiration
      return nowMillis;
    case 'limit':
    case 'multi_limit': {
      if (
        params.timeInForceType !== 'good_until' ||
        !params.timeInForceInDays
      ) {
        // fallback to nowMillis / infinite expiration
        return nowMillis;
      }
      // calculate expiration time in seconds
      return millisToSeconds(
        getTime(addDays(nowMillis, params.timeInForceInDays.toNumber())),
      );
    }
    case 'twap': {
      const runtimeInMillis = calculateTwapRuntimeInMillis(
        params.triggerCriteria.interval,
        params.numberOfOrders,
      );

      return millisToSeconds(
        // Add 5 seconds to ensure expirationTime is greater than 'now'.
        // The backend rejects orders if expiration < current time.
        // Note: this delay needs to be lenient enough to handle any latency between frontend & backend
        getTime(nowMillis + runtimeInMillis + 5000),
      );
    }
  }
}
