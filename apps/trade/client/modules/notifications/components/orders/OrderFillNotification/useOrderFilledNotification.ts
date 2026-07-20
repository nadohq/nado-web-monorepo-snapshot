import { BigNumbers, removeDecimals } from '@nadohq/client';
import {
  toXStocksDisplayAmount,
  toXStocksDisplayPrice,
} from '@nadohq/react-client';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import {
  OrderFillNotificationData,
  OrderNotificationMetadata,
} from 'client/modules/notifications/types';
import { isTpSlMaxOrderSize } from 'client/modules/trading/tpsl/utils/isTpSlMaxOrderSize';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import { useMemo } from 'react';

export function useOrderFilledNotification(data: OrderFillNotificationData) {
  const {
    productId,
    fillPrice,
    newOrderFilledAmount,
    totalAmount,
    orderDisplayType,
    orderAppendix,
  } = data;

  const { data: marketsStaticData } = useAllMarketsStaticData();
  const market = marketsStaticData?.allMarkets[productId];

  const { getExchangeRate } = useGetXStocksExchangeRate();
  const exchangeRate = useMemo(
    () => getExchangeRate(productId),
    [getExchangeRate, productId],
  );

  return useMemo(() => {
    if (!market) {
      return undefined;
    }
    const metadata: OrderNotificationMetadata = (() => {
      const priceIncrement = market.priceIncrement;
      const sizeIncrement = market.sizeIncrement;
      const sharedProductMetadata = getSharedProductMetadata(market.metadata);

      return {
        ...sharedProductMetadata,
        marketName: market.metadata.marketName,
        priceIncrement,
        sizeIncrement,
      };
    })();

    // TPSL orders are placed with a very large amount to close the entire position, so fractionFilled will be derived
    // improperly if we don't do this check
    const isTpSlOrderWithMaxSize = isTpSlMaxOrderSize(
      removeDecimals(totalAmount),
    );
    // Backend events have SLIGHT rounding errors, so in some cases we end up with a fill amount slightly greater than 1
    const fractionFilled = isTpSlOrderWithMaxSize
      ? BigNumbers.ONE
      : newOrderFilledAmount.div(totalAmount).precision(2);

    const decimalAdjustedFilledAmount = toXStocksDisplayAmount(
      removeDecimals(newOrderFilledAmount),
      exchangeRate,
    );

    return {
      market,
      metadata,
      exchangeRate,
      fillPrice: toXStocksDisplayPrice(fillPrice, exchangeRate),
      orderDisplayType,
      orderAppendix,
      decimalAdjustedFilledAmount,
      fractionFilled,
      fillStatus: fractionFilled.eq(1) ? 'full' : 'partial',
    };
  }, [
    market,
    totalAmount,
    newOrderFilledAmount,
    fillPrice,
    exchangeRate,
    orderAppendix,
    orderDisplayType,
  ]);
}
