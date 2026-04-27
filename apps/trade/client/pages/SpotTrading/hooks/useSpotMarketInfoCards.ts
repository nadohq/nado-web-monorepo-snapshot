import { removeDecimals } from '@nadohq/client';
import {
  AnnotatedSpotMarket,
  getMarketPriceFormatSpecifier,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useAllMarketsStats } from 'client/hooks/markets/useAllMarketsStats';
import { useLatestOrderFill } from 'client/hooks/markets/useLatestOrderFill';
import { useLatestValueChange } from 'client/hooks/markets/useLatestValueChange';
import { useMarket } from 'client/hooks/markets/useMarket';
import { useSpotInterestRates } from 'client/hooks/markets/useSpotInterestRates';
import { useSpotOrderFormContext } from 'client/pages/SpotTrading/context/SpotOrderFormContext';
import { useMemo } from 'react';

export interface SpotMarketInfo {
  priceFormatSpecifier: string;
  signedPriceFormatSpecifier: string;
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

  const spotMarketInfo = useMemo<SpotMarketInfo | undefined>(() => {
    if (spotMarket == null || !productId) {
      return;
    }

    const marketStats = marketStatsData?.statsByMarket[productId];
    const marketPriceChange = marketStats?.pastDayPriceChange;

    return {
      priceFormatSpecifier: getMarketPriceFormatSpecifier(
        spotMarket.priceIncrement,
      ),
      signedPriceFormatSpecifier: getMarketPriceFormatSpecifier(
        spotMarket.priceIncrement,
        true,
      ),
      currentPrice: latestOrderFillPrice?.price,
      priceChange24h: marketPriceChange,
      priceChangeFrac24h: marketStats?.pastDayPriceChangeFrac,
      oraclePrice: spotMarket.product.oraclePrice,
      quoteVolume24h: removeDecimals(marketStats?.pastDayVolumeInQuote),
      latestPriceChange: latestPriceChange ?? marketPriceChange,
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
  ]);

  return {
    productId,
    spotMarketInfo,
  };
}
