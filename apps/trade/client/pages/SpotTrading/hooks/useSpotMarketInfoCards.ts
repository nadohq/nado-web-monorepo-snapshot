import { removeDecimals } from '@nadohq/client';
import {
  AnnotatedSpotMarket,
  getMarketPriceFormatSpecifier,
  NumberFormatSpecifier,
  toXStocksDisplayPrice,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useAllMarketsStats } from 'client/hooks/markets/useAllMarketsStats';
import { useLatestOrderFill } from 'client/hooks/markets/useLatestOrderFill';
import { useLatestValueChange } from 'client/hooks/markets/useLatestValueChange';
import { useMarket } from 'client/hooks/markets/useMarket';
import { useSpotInterestRates } from 'client/hooks/markets/useSpotInterestRates';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
import { useSpotOrderFormContext } from 'client/pages/SpotTrading/context/SpotOrderFormContext';
import { useMemo } from 'react';

export interface SpotMarketInfo {
  priceFormatSpecifier: NumberFormatSpecifier;
  signedPriceFormatSpecifier: NumberFormatSpecifier;
  currentPrice: BigNumber | undefined;
  oraclePrice: BigNumber;
  priceChange24h: BigNumber | undefined;
  priceChangeFrac24h: BigNumber | undefined;
  quoteVolume24h: BigNumber | undefined;
  latestPriceChange: BigNumber | undefined;
  quoteSymbol: string | undefined;
  borrowRate: BigNumber | undefined;
}

interface UseSpotMarketInfoCards {
  productId: number | undefined;
  spotMarketInfo: SpotMarketInfo | undefined;
}

export function useSpotMarketInfoCards(): UseSpotMarketInfoCards {
  const { currentMarket, quoteMetadata } = useSpotOrderFormContext();
  const productId = currentMarket?.productId;
  const { data: spotInterestRates } = useSpotInterestRates();
  const { data: spotMarket } = useMarket<AnnotatedSpotMarket>({ productId });
  const { data: marketStatsData } = useAllMarketsStats();
  const { data: latestOrderFillPrice } = useLatestOrderFill({ productId });
  const latestPriceChange = useLatestValueChange(latestOrderFillPrice?.price);
  const { getExchangeRate } = useGetXStocksExchangeRate();

  const spotMarketInfo = useMemo<SpotMarketInfo | undefined>(() => {
    if (spotMarket == null || !productId) {
      return;
    }

    const exchangeRate = getExchangeRate(productId);
    const marketStats = marketStatsData?.statsByMarket[productId];
    const marketPriceChange = toXStocksDisplayPrice(
      marketStats?.pastDayPriceChange,
      exchangeRate,
    );

    return {
      priceFormatSpecifier: getMarketPriceFormatSpecifier({
        priceIncrement: spotMarket.priceIncrement,
        exchangeRate,
      }),
      signedPriceFormatSpecifier: getMarketPriceFormatSpecifier({
        priceIncrement: spotMarket.priceIncrement,
        isSigned: true,
        exchangeRate,
      }),
      currentPrice: toXStocksDisplayPrice(
        latestOrderFillPrice?.price,
        exchangeRate,
      ),
      priceChange24h: marketPriceChange,
      priceChangeFrac24h: marketStats?.pastDayPriceChangeFrac,
      oraclePrice: toXStocksDisplayPrice(
        spotMarket.product.oraclePrice,
        exchangeRate,
      ),
      quoteVolume24h: removeDecimals(marketStats?.pastDayVolumeInQuote),
      latestPriceChange:
        toXStocksDisplayPrice(latestPriceChange, exchangeRate) ??
        marketPriceChange,
      quoteSymbol: quoteMetadata?.symbol,
      borrowRate: spotInterestRates?.[productId]?.borrow,
    };
  }, [
    spotMarket,
    productId,
    marketStatsData?.statsByMarket,
    quoteMetadata?.symbol,
    spotInterestRates,
    latestOrderFillPrice?.price,
    latestPriceChange,
    getExchangeRate,
  ]);

  return {
    productId,
    spotMarketInfo,
  };
}
