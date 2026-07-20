import { BigNumbers, removeDecimals } from '@nadohq/client';
import {
  getMarketPriceFormatSpecifier,
  getMarketSizeFormatSpecifier,
  toXStocksDisplayAmount,
  toXStocksDisplayPrice,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useMarket } from 'client/hooks/markets/useMarket';
import { useQueryLatestOrderFillsForProduct } from 'client/hooks/query/markets/useQueryLatestOrderFillsForProduct';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
import { priceInputAtom } from 'client/store/trading/commonTradingStore';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import { secondsToMilliseconds } from 'date-fns';
import { useSetAtom } from 'jotai';
import { useMemo } from 'react';

interface Params {
  productId?: number;
}

export interface MarketTradeRowItem {
  id: string;
  timestampMillis: number;
  price: BigNumber;
  decimalAdjustedSize: BigNumber;
  isSell: boolean;
}

interface Data {
  symbol: string;
  trades: MarketTradeRowItem[];
  maxTradeSize: BigNumber;
}

export function useLatestMarketTrades({ productId }: Params) {
  const { data: market, isLoading: loadingMarket } = useMarket({
    productId,
  });
  const { data: marketTradesData, isLoading: loadingMarketTrades } =
    useQueryLatestOrderFillsForProduct({ productId });
  const { getExchangeRate } = useGetXStocksExchangeRate();
  const exchangeRate = getExchangeRate(market?.productId);

  const setNewPriceInput = useSetAtom(priceInputAtom);

  const mappedData = useMemo((): Data | undefined => {
    if (market == null || marketTradesData == null) {
      return;
    }

    const { symbol } = getSharedProductMetadata(market.metadata);

    let maxTradeSize = BigNumbers.ZERO;

    const trades = marketTradesData.map((trade): MarketTradeRowItem => {
      const { amount, price, timestamp } = trade;
      const decimalAdjustedAmount = removeDecimals(amount);
      const displaySize = toXStocksDisplayAmount(
        decimalAdjustedAmount.abs(),
        exchangeRate,
      );

      // A bit of an anti-pattern to update another variable in a `.map`, but this saves on performance
      if (displaySize.gt(maxTradeSize)) {
        maxTradeSize = displaySize;
      }

      const timestampMillis = secondsToMilliseconds(timestamp);

      return {
        id: trade.id,
        isSell: decimalAdjustedAmount.lt(0),
        price: toXStocksDisplayPrice(price, exchangeRate),
        timestampMillis,
        decimalAdjustedSize: displaySize,
      };
    });

    return {
      trades,
      maxTradeSize,
      symbol,
    };
  }, [market, marketTradesData, exchangeRate]);

  const priceFormatSpecifier = getMarketPriceFormatSpecifier({
    priceIncrement: market?.priceIncrement,
    exchangeRate,
  });
  const amountFormatSpecifier = getMarketSizeFormatSpecifier({
    sizeIncrement: market?.sizeIncrement,
    exchangeRate,
  });

  return {
    data: mappedData,
    priceFormatSpecifier,
    amountFormatSpecifier,
    isLoading: loadingMarket || loadingMarketTrades,
    setNewPriceInput,
  };
}
