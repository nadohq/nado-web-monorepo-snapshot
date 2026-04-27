import {
  BalanceSide,
  OrderAppendix,
  PriceTriggerCriteria,
} from '@nadohq/client';
import { MARKET_ORDER_EXECUTION_TYPE } from 'client/modules/trading/consts/marketOrderExecutionType';
import { getIsTriggerPriceAbove } from 'client/modules/trading/utils/trigger/getIsTriggerPriceAbove';
import { type TFunction } from 'i18next';

export interface GetOrderTypeLabelParams {
  t: TFunction;
  orderAppendix: OrderAppendix;
  orderSide: BalanceSide;
  priceTriggerCriteria: PriceTriggerCriteria | undefined;
}

export function getOrderTypeLabel({
  t,
  orderAppendix,
  priceTriggerCriteria,
  orderSide,
}: GetOrderTypeLabelParams) {
  const isMarket =
    orderAppendix.orderExecutionType === MARKET_ORDER_EXECUTION_TYPE;

  switch (orderAppendix.triggerType) {
    case 'twap':
    case 'twap_custom_amounts':
      return isMarket
        ? t(($) => $.orderTypes.twapMarket)
        : t(($) => $.orderTypes.twapLimit);

    case 'price':
      if (!orderAppendix.reduceOnly || !priceTriggerCriteria) {
        return isMarket
          ? t(($) => $.orderTypes.stopMarket)
          : t(($) => $.orderTypes.stopLimit);
      }

      const isTriggerPriceAbove = getIsTriggerPriceAbove(
        priceTriggerCriteria.type,
      );

      const isTakeProfit =
        // For long position (reduce = Short order), trigger price above is take profit.
        (orderSide === 'short' && isTriggerPriceAbove) ||
        // For short position (reduce = Long order), trigger price below is take profit.
        (orderSide === 'long' && !isTriggerPriceAbove);

      if (isTakeProfit) {
        return isMarket
          ? t(($) => $.orderTypes.takeProfitMarket)
          : t(($) => $.orderTypes.takeProfitLimit);
      }

      return isMarket
        ? t(($) => $.orderTypes.stopLossMarket)
        : t(($) => $.orderTypes.stopLossLimit);

    default:
      return isMarket
        ? t(($) => $.orderTypes.market)
        : t(($) => $.orderTypes.limit);
  }
}
