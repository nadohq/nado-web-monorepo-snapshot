import { removeDecimals } from '@nadohq/client';
import {
  AnnotatedPerpMarket,
  FundingRates,
  getFundingRates,
  getMarketPriceFormatSpecifier,
  PerpProductMetadata,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useAllMarketsStats } from 'client/hooks/markets/useAllMarketsStats';
import { useLatestOrderFill } from 'client/hooks/markets/useLatestOrderFill';
import { useLatestValueChange } from 'client/hooks/markets/useLatestValueChange';
import { useMarket } from 'client/hooks/markets/useMarket';
import { useQueryAllMarkets24hFundingRates } from 'client/hooks/query/markets/useQueryAllMarkets24hFundingRates';
import { useQueryLatestOraclePrices } from 'client/hooks/query/markets/useQueryLatestOraclePrices';
import { useQueryLatestPerpPrices } from 'client/hooks/query/markets/useQueryLatestPerpPrices';
import { useNextFundingTime } from 'client/modules/trading/hooks/useNextFundingTime';
import { usePerpOrderFormContext } from 'client/pages/PerpTrading/context/PerpOrderFormContext';
import { useMemo } from 'react';

export interface PerpMarketInfo {
  priceFormatSpecifier: string;
  signedPriceFormatSpecifier: string;
  oraclePrice: BigNumber;
  indexPrice: BigNumber | undefined;
  marketPrice: BigNumber | undefined;
  priceChange24h: BigNumber | undefined;
  priceChangeFrac24h: BigNumber | undefined;
  quoteVolume24h: BigNumber | undefined;
  openInterestQuote: BigNumber | undefined;
  fundingRates: FundingRates | undefined;
  metadata: PerpProductMetadata;
  latestPriceChange: BigNumber | undefined;
}

interface UsePerpMarketInfoCards {
  productId: number | undefined;
  perpMarketInfo: PerpMarketInfo | undefined;
  millisToNextFunding: number | undefined;
  quoteSymbol: string;
}

export function usePerpMarketInfoCards(): UsePerpMarketInfoCards {
  const { primaryQuoteToken } = useNadoMetadataContext();
  const { currentMarket: staticMarketData } = usePerpOrderFormContext();
  const productId = staticMarketData?.productId;

  const { data: perpMarket } = useMarket<AnnotatedPerpMarket>({ productId });
  const { millisToNextFunding } = useNextFundingTime();
  const { data: marketStatsData } = useAllMarketsStats();
  const { data: fundingRatesData } = useQueryAllMarkets24hFundingRates();
  const { data: latestPerpPricesData } = useQueryLatestPerpPrices();
  const { data: latestOraclePricesData } = useQueryLatestOraclePrices();
  const { data: latestOrderFillPrice } = useLatestOrderFill({ productId });
  const latestPriceChange = useLatestValueChange(latestOrderFillPrice?.price);

  const perpMarketInfo = useMemo<PerpMarketInfo | undefined>(() => {
    if (perpMarket == null) {
      return;
    }
    const productId = perpMarket.productId;

    const marketStats = marketStatsData?.statsByMarket[productId];
    const marketPriceChange = marketStats?.pastDayPriceChange;
    const dailyFundingRate = fundingRatesData?.[productId]?.fundingRate;
    const oraclePrice =
      latestOraclePricesData?.[productId]?.oraclePrice ??
      perpMarket.product.oraclePrice;
    const indexPrice = latestPerpPricesData?.[productId]?.indexPrice;

    return {
      priceFormatSpecifier: getMarketPriceFormatSpecifier(
        perpMarket.priceIncrement,
      ),
      signedPriceFormatSpecifier: getMarketPriceFormatSpecifier(
        perpMarket.priceIncrement,
        true,
      ),
      fundingRates: dailyFundingRate
        ? getFundingRates(dailyFundingRate)
        : undefined,
      openInterestQuote: removeDecimals(marketStats?.openInterestQuote),
      metadata: perpMarket.metadata,
      marketPrice: latestOrderFillPrice?.price,
      oraclePrice,
      indexPrice,
      priceChange24h: marketPriceChange,
      priceChangeFrac24h: marketStats?.pastDayPriceChangeFrac,
      quoteVolume24h: removeDecimals(marketStats?.pastDayVolumeInPrimaryQuote),
      latestPriceChange: latestPriceChange ?? marketPriceChange,
    };
  }, [
    perpMarket,
    marketStatsData?.statsByMarket,
    fundingRatesData,
    latestOraclePricesData,
    latestPerpPricesData,
    latestOrderFillPrice?.price,
    latestPriceChange,
  ]);

  return {
    productId,
    perpMarketInfo,
    millisToNextFunding,
    quoteSymbol: primaryQuoteToken.symbol,
  };
}
