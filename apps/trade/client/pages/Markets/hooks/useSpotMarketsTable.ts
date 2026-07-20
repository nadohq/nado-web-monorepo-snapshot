import { removeDecimals } from '@nadohq/client';
import {
  getMarketPriceFormatSpecifier,
  NumberFormatSpecifier,
  SpotProductMetadata,
  toXStocksDisplayPrice,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { useAllMarketsStats } from 'client/hooks/markets/useAllMarketsStats';
import { useFavoritedMarkets } from 'client/hooks/markets/useFavoritedMarkets';
import { useQueryAllMarketsLatestPrices } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { SEARCH_WEIGHTS } from 'client/hooks/ui/search/consts';
import { useSearch } from 'client/hooks/ui/search/useSearch';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
import { useMemo } from 'react';

export interface SpotMarketTableItem extends WithDataTableRowId {
  rowId: string;
  metadata: SpotProductMetadata;
  productId: number;
  currentPrice: BigNumber | undefined;
  priceChange24h: BigNumber | undefined;
  priceChangeFrac24h: BigNumber | undefined;
  volume24h: BigNumber | undefined;
  isNewMarket: boolean;
  isFavorited: boolean;
  marketPriceFormatSpecifier: NumberFormatSpecifier;
}

export function useSpotMarketsTable({ query }: { query: string }) {
  const { data: allMarketData, isLoading: isAllMarketDataLoading } =
    useAllMarkets();
  const { data: marketStatsData } = useAllMarketsStats();
  const { data: latestMarketPricesData } = useQueryAllMarketsLatestPrices();
  const { favoritedMarketIds, toggleIsFavoritedMarket } = useFavoritedMarkets();
  const { getExchangeRate } = useGetXStocksExchangeRate();
  const isConnected = useIsConnected();
  const { getIsHiddenMarket, getIsNewMarket } = useNadoMetadataContext();

  const spotMarkets = allMarketData?.spotMarkets;

  const mappedData: SpotMarketTableItem[] | undefined = useMemo(() => {
    if (!spotMarkets) {
      return;
    }

    return Object.values(spotMarkets)
      .filter((market) => !getIsHiddenMarket(market.productId))
      .map((market) => {
        const productId = market.productId;
        const marketStats = marketStatsData?.statsByMarket[productId];
        const latestMarketPrices = latestMarketPricesData?.[productId];
        const exchangeRate = getExchangeRate(productId);

        return {
          rowId: String(productId),
          metadata: market.metadata,
          productId: market.productId,
          currentPrice: toXStocksDisplayPrice(
            latestMarketPrices?.safeMidPrice,
            exchangeRate,
          ),
          priceChange24h: toXStocksDisplayPrice(
            marketStats?.pastDayPriceChange,
            exchangeRate,
          ),
          priceChangeFrac24h: marketStats?.pastDayPriceChangeFrac,
          volume24h: removeDecimals(marketStats?.pastDayVolumeInPrimaryQuote),
          isNewMarket: getIsNewMarket(productId),
          isFavorited: favoritedMarketIds.has(productId),
          marketPriceFormatSpecifier: getMarketPriceFormatSpecifier({
            priceIncrement: market.priceIncrement,
            exchangeRate,
          }),
        };
      });
  }, [
    spotMarkets,
    getIsHiddenMarket,
    marketStatsData?.statsByMarket,
    latestMarketPricesData,
    getExchangeRate,
    getIsNewMarket,
    favoritedMarketIds,
  ]);

  const { results } = useSearch({
    query,
    config: {
      items: mappedData,
      searchKeys: [
        { name: 'metadata.marketName', weight: SEARCH_WEIGHTS.HIGH },
        { name: 'metadata.token.symbol', weight: SEARCH_WEIGHTS.HIGH },
        { name: 'metadata.altSearchTerms', weight: SEARCH_WEIGHTS.MEDIUM },
      ],
    },
  });

  return {
    isLoading: isAllMarketDataLoading,
    spotProducts: results,
    toggleIsFavoritedMarket,
    disableFavoriteButton: !isConnected,
  };
}
