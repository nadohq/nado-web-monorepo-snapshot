import {
  EngineOrder,
  IndexerMatchEvent,
  IndexerOrder,
  removeDecimals,
  toBigNumber,
  TriggerOrderInfo,
  unpackOrderAppendix,
} from '@nadohq/client';
import { OrderTableItem } from 'client/modules/tables/types/OrderTableItem';
import { MARKET_ORDER_EXECUTION_TYPE } from 'client/modules/trading/consts/marketOrderExecutionType';
import { isTpSlMaxOrderSize } from 'client/modules/trading/tpsl/utils/isTpSlMaxOrderSize';

type Params =
  | {
      indexerOrder: IndexerOrder;
    }
  | {
      indexerMatchEvent: IndexerMatchEvent;
    }
  | {
      engineOrder: EngineOrder;
    }
  | {
      triggerOrderInfo: TriggerOrderInfo;
    };

export function getOrderTableItem(order: Params): OrderTableItem {
  const { digest, orderAppendix, orderPrice, orderAmount } = (() => {
    if ('indexerOrder' in order) {
      return {
        digest: order.indexerOrder.digest,
        orderAppendix: order.indexerOrder.appendix,
        orderPrice: order.indexerOrder.price,
        orderAmount: removeDecimals(order.indexerOrder.amount),
      };
    } else if ('indexerMatchEvent' in order) {
      return {
        digest: order.indexerMatchEvent.digest,
        orderAppendix: unpackOrderAppendix(
          order.indexerMatchEvent.order.appendix,
        ),
        orderPrice: removeDecimals(
          toBigNumber(order.indexerMatchEvent.order.priceX18),
        ),
        orderAmount: removeDecimals(
          toBigNumber(order.indexerMatchEvent.order.amount),
        ),
      };
    } else if ('engineOrder' in order) {
      return {
        digest: order.engineOrder.digest,
        orderAppendix: order.engineOrder.appendix,
        orderPrice: order.engineOrder.price,
        orderAmount: removeDecimals(order.engineOrder.totalAmount),
      };
    } else {
      return {
        digest: order.triggerOrderInfo.order.digest,
        orderAppendix: order.triggerOrderInfo.order.appendix,
        orderPrice: order.triggerOrderInfo.order.price,
        orderAmount: removeDecimals(order.triggerOrderInfo.order.amount),
      };
    }
  })();

  const totalBaseSize = orderAmount.abs();

  return {
    digest,
    orderSide: orderAmount.isPositive() ? 'long' : 'short',
    orderAppendix,
    isMarket: orderAppendix.orderExecutionType === MARKET_ORDER_EXECUTION_TYPE,
    isReduceOnly: !!orderAppendix.reduceOnly,
    isIsolated: !!orderAppendix.isolated,
    isCloseEntirePosition: isTpSlMaxOrderSize(totalBaseSize),
    orderPrice,
    totalBaseAmount: orderAmount,
    totalBaseSize,
    totalQuoteSize: totalBaseSize.multipliedBy(orderPrice),
    rowId: digest,
  };
}
