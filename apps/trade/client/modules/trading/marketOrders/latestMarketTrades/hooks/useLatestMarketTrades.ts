import { BigNumbers, removeDecimals } from '@nadohq/client';
import {
  getMarketPriceFormatSpecifier,
  getMarketSizeFormatSpecifier,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useMarket } from 'client/hooks/markets/useMarket';
import { useQueryLatestOrderFillsForProduct } from 'client/hooks/query/markets/useQueryLatestOrderFillsForProduct';
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
  priceIncrement: BigNumber;
  sizeIncrement: BigNumber;
}

export function useLatestMarketTrades({ productId }: Params) {
  const { data: market, isLoading: loadingMarket } = useMarket({
    productId,
  });
  const { data: marketTradesData, isLoading: loadingMarketTrades } =
    useQueryLatestOrderFillsForProduct({ productId });

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

      // A bit of an anti-pattern to update another variable in a `.map`, but this saves on performance
      if (decimalAdjustedAmount.abs().gt(maxTradeSize)) {
        maxTradeSize = decimalAdjustedAmount.abs();
      }

      const timestampMillis = secondsToMilliseconds(timestamp);
      const decimalAdjustedSize = decimalAdjustedAmount.abs();

      return {
        id: trade.id,
        isSell: decimalAdjustedAmount.lt(0),
        price,
        timestampMillis,
        decimalAdjustedSize,
      };
    });

    return {
      trades,
      priceIncrement: market.priceIncrement,
      sizeIncrement: market.sizeIncrement,
      maxTradeSize,
      symbol,
    };
  }, [market, marketTradesData]);

  const priceFormatSpecifier = getMarketPriceFormatSpecifier(
    mappedData?.priceIncrement,
  );
  const amountFormatSpecifier = getMarketSizeFormatSpecifier({
    sizeIncrement: mappedData?.sizeIncrement,
  });

  return {
    data: mappedData,
    priceFormatSpecifier,
    amountFormatSpecifier,
    isLoading: loadingMarket || loadingMarketTrades,
    setNewPriceInput,
  };
}
