import { removeDecimals } from '@nadohq/client';
import {
  getFundingRates,
  getMarketPriceFormatSpecifier,
  NumberFormatSpecifier,
  PerpProductMetadata,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { useAllMarketsStats } from 'client/hooks/markets/useAllMarketsStats';
import { useFavoritedMarkets } from 'client/hooks/markets/useFavoritedMarkets';
import { useQueryAllMarkets24hFundingRates } from 'client/hooks/query/markets/useQueryAllMarkets24hFundingRates';
import { useQueryAllMarketsLatestPrices } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { useQueryLatestOraclePrices } from 'client/hooks/query/markets/useQueryLatestOraclePrices';
import { useQueryLatestPerpPrices } from 'client/hooks/query/markets/useQueryLatestPerpPrices';
import { SEARCH_WEIGHTS } from 'client/hooks/ui/search/consts';
import { useSearch } from 'client/hooks/ui/search/useSearch';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { useFundingRatePeriod } from 'client/modules/trading/hooks/useFundingRatePeriod';
import { getFundingRateForPeriod } from 'client/pages/Markets/utils/getFundingRateForPeriod';
import { useMemo } from 'react';

export interface PerpMarketTableItem extends WithDataTableRowId {
  rowId: string;
  metadata: PerpProductMetadata;
  productId: number;
  currentPrice: BigNumber | undefined;
  indexPrice: BigNumber | undefined;
  oraclePrice: BigNumber | undefined;
  openInterestQuote: BigNumber | undefined;
  priceChange24h: BigNumber | undefined;
  priceChangeFrac24h: BigNumber | undefined;
  volume24h: BigNumber | undefined;
  isNewMarket: boolean;
  isFavorited: boolean;
  fundingRate: BigNumber | undefined;
  marketPriceFormatSpecifier: NumberFormatSpecifier;
}

export function usePerpMarketsTable({ query }: { query: string }) {
  const { fundingRatePeriod } = useFundingRatePeriod();
  const { getIsHiddenMarket, getIsNewMarket } = useNadoMetadataContext();
  const { data: allMarketData, isLoading: isAllMarketDataLoading } =
    useAllMarkets();
  const { data: latestPerpPricesData } = useQueryLatestPerpPrices();
  const { data: latestOraclePricesData } = useQueryLatestOraclePrices();
  const { data: marketStatsData } = useAllMarketsStats();
  const { data: latestMarketPricesData } = useQueryAllMarketsLatestPrices();
  const { data: fundingRateData } = useQueryAllMarkets24hFundingRates();
  const { favoritedMarketIds, toggleIsFavoritedMarket } = useFavoritedMarkets();
  const isConnected = useIsConnected();
  const perpMarkets = allMarketData?.perpMarkets;

  const mappedData: PerpMarketTableItem[] | undefined = useMemo(() => {
    if (!perpMarkets) {
      return;
    }

    return Object.values(perpMarkets)
      .filter((market) => !getIsHiddenMarket(market.productId))
      .map((market) => {
        const productId = market.productId;
        const marketStats = marketStatsData?.statsByMarket[productId];
        const latestMarketPrices = latestMarketPricesData?.[productId];
        const latestPerpPrices = latestPerpPricesData?.[productId];

        const oraclePrice = latestOraclePricesData?.[productId]?.oraclePrice;
        const dailyFundingRate = fundingRateData?.[productId]?.fundingRate;
        const fundingRates = dailyFundingRate
          ? getFundingRates(dailyFundingRate)
          : undefined;

        return {
          rowId: String(productId),
          metadata: market.metadata,
          productId: market.productId,
          currentPrice: latestMarketPrices?.safeMidPrice,
          oraclePrice,
          indexPrice: latestPerpPrices?.indexPrice,
          priceChange24h: marketStats?.pastDayPriceChange,
          priceChangeFrac24h: marketStats?.pastDayPriceChangeFrac,
          volume24h: removeDecimals(marketStats?.pastDayVolumeInPrimaryQuote),
          openInterestQuote: removeDecimals(marketStats?.openInterestQuote),
          isNewMarket: getIsNewMarket(productId),
          isFavorited: favoritedMarketIds.has(productId),
          fundingRate: getFundingRateForPeriod(fundingRates, fundingRatePeriod),
          marketPriceFormatSpecifier: getMarketPriceFormatSpecifier({
            priceIncrement: market.priceIncrement,
            exchangeRate: undefined,
          }),
        };
      });
  }, [
    perpMarkets,
    getIsHiddenMarket,
    marketStatsData?.statsByMarket,
    latestMarketPricesData,
    latestPerpPricesData,
    latestOraclePricesData,
    fundingRateData,
    getIsNewMarket,
    favoritedMarketIds,
    fundingRatePeriod,
  ]);

  const { results } = useSearch({
    query,
    config: {
      items: mappedData,
      searchKeys: [
        { name: 'metadata.marketName', weight: SEARCH_WEIGHTS.HIGH },
        { name: 'metadata.symbol', weight: SEARCH_WEIGHTS.HIGH },
        { name: 'metadata.altSearchTerms', weight: SEARCH_WEIGHTS.MEDIUM },
      ],
    },
  });

  return {
    isLoading: isAllMarketDataLoading,
    perpProducts: results,
    toggleIsFavoritedMarket,
    disableFavoriteButton: !isConnected,
  };
}
