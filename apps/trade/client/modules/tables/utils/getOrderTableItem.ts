import {
  EngineOrder,
  IndexerMatchEvent,
  IndexerOrder,
  removeDecimals,
  toBigNumber,
  TriggerOrderInfo,
  unpackOrderAppendix,
} from '@nadohq/client';
import {
  toXStocksDisplayAmount,
  toXStocksDisplayPrice,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { OrderTableItem } from 'client/modules/tables/types/OrderTableItem';
import { MARKET_ORDER_EXECUTION_TYPE } from 'client/modules/trading/consts/marketOrderExecutionType';
import { isTpSlMaxOrderSize } from 'client/modules/trading/tpsl/utils/isTpSlMaxOrderSize';

type OrderSource =
  | { indexerOrder: IndexerOrder }
  | { indexerMatchEvent: IndexerMatchEvent }
  | { engineOrder: EngineOrder }
  | { triggerOrderInfo: TriggerOrderInfo };

type Params = OrderSource & { exchangeRate: BigNumber };

export function getOrderTableItem(params: Params): OrderTableItem {
  const { digest, orderAppendix, orderPrice, orderAmount } = (() => {
    if ('indexerOrder' in params) {
      return {
        digest: params.indexerOrder.digest,
        orderAppendix: params.indexerOrder.appendix,
        orderPrice: params.indexerOrder.price,
        orderAmount: removeDecimals(params.indexerOrder.amount),
      };
    } else if ('indexerMatchEvent' in params) {
      return {
        digest: params.indexerMatchEvent.digest,
        orderAppendix: unpackOrderAppendix(
          params.indexerMatchEvent.order.appendix,
        ),
        orderPrice: removeDecimals(
          toBigNumber(params.indexerMatchEvent.order.priceX18),
        ),
        orderAmount: removeDecimals(
          toBigNumber(params.indexerMatchEvent.order.amount),
        ),
      };
    } else if ('engineOrder' in params) {
      return {
        digest: params.engineOrder.digest,
        orderAppendix: params.engineOrder.appendix,
        orderPrice: params.engineOrder.price,
        orderAmount: removeDecimals(params.engineOrder.totalAmount),
      };
    } else {
      return {
        digest: params.triggerOrderInfo.order.digest,
        orderAppendix: params.triggerOrderInfo.order.appendix,
        orderPrice: params.triggerOrderInfo.order.price,
        orderAmount: removeDecimals(params.triggerOrderInfo.order.amount),
      };
    }
  })();

  const rawTotalBaseSize = orderAmount.abs();
  const { exchangeRate } = params;

  const displayOrderPrice = toXStocksDisplayPrice(orderPrice, exchangeRate);
  const displayTotalBaseAmount = toXStocksDisplayAmount(
    orderAmount,
    exchangeRate,
  );
  const displayTotalBaseSize = displayTotalBaseAmount.abs();

  return {
    digest,
    orderSide: orderAmount.isPositive() ? 'long' : 'short',
    orderAppendix,
    isMarket: orderAppendix.orderExecutionType === MARKET_ORDER_EXECUTION_TYPE,
    isReduceOnly: !!orderAppendix.reduceOnly,
    isIsolated: !!orderAppendix.isolated,
    // Use raw size for the sentinel value check — the "entire position" flag must reflect the original order
    isCloseEntirePosition: isTpSlMaxOrderSize(rawTotalBaseSize),
    orderPrice: displayOrderPrice,
    totalBaseAmount: displayTotalBaseAmount,
    totalBaseSize: displayTotalBaseSize,
    totalQuoteSize: displayTotalBaseSize.multipliedBy(displayOrderPrice),
    rowId: digest,
  };
}
