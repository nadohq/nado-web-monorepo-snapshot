import { MarketCategory } from '@nadohq/react-client';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useAllMarketsStats } from 'client/hooks/markets/useAllMarketsStats';
import { useFavoritedMarkets } from 'client/hooks/markets/useFavoritedMarkets';
import { useQueryAllMarkets24hFundingRates } from 'client/hooks/query/markets/useQueryAllMarkets24hFundingRates';
import { useQueryAllMarketsLatestPrices } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { useProductIdLinks } from 'client/hooks/ui/navigation/useProductIdLinks';
import { SEARCH_WEIGHTS } from 'client/hooks/ui/search/consts';
import { useSearch } from 'client/hooks/ui/search/useSearch';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { MarketSwitcherItem } from 'client/modules/trading/components/TradingMarketSwitcher/types';
import {
  getMappedMarket,
  volumeComparator,
} from 'client/modules/trading/components/TradingMarketSwitcher/utils';
import { get } from 'lodash';
import { useMemo, useState } from 'react';

export interface UseTradingMarketSwitcher {
  allMarkets: MarketSwitcherItem[] | undefined;
  isLoading: boolean;
  displayedMarkets: MarketSwitcherItem[];
  toggleIsFavoritedMarket: (marketId: number) => void;
  selectedMarketCategory: MarketCategory | undefined;
  setSelectedMarketCategory: (
    marketCategory: MarketCategory | undefined,
  ) => void;
  query: string;
  setQuery: (query: string) => void;
  disableFavoriteButton: boolean;
  selectedMarket: MarketSwitcherItem | undefined;
  isMarketSwitcherOpen: boolean;
  disableMarketSwitcherButton: boolean;
  setIsMarketSwitcherOpen: (open: boolean) => void;
}

export function useTradingMarketSwitcher(
  productId: number | undefined,
  defaultMarketCategory: MarketCategory,
): UseTradingMarketSwitcher {
  const [query, setQuery] = useState('');
  const [selectedMarketCategory, setSelectedMarketCategory] = useState<
    MarketCategory | undefined
  >(defaultMarketCategory);
  const [isMarketSwitcherOpen, setIsMarketSwitcherOpen] = useState(false);

  const isConnected = useIsConnected();

  const { data: allMarketsStaticData, isLoading: isLoadingMarketsStaticData } =
    useAllMarketsStaticData();
  const { data: latestMarketPricesData } = useQueryAllMarketsLatestPrices();
  const { data: marketStatsData } = useAllMarketsStats();
  const { favoritedMarketIds, toggleIsFavoritedMarket } = useFavoritedMarkets();
  const { data: fundingRatesData } = useQueryAllMarkets24hFundingRates();

  const productIdLinks = useProductIdLinks();

  const allMarkets = useMemo(() => {
    if (!allMarketsStaticData) {
      return [];
    }

    return Object.values(allMarketsStaticData.allMarkets)
      .filter((market) => !market.isHidden)
      .map((market) =>
        getMappedMarket(
          market,
          latestMarketPricesData,
          marketStatsData,
          fundingRatesData,
          favoritedMarketIds.has(market.productId),
          get(productIdLinks, market.productId, undefined) ?? '',
        ),
      );
  }, [
    allMarketsStaticData,
    favoritedMarketIds,
    fundingRatesData,
    latestMarketPricesData,
    marketStatsData,
    productIdLinks,
  ]);

  const marketsForProductType = useMemo(() => {
    if (!allMarkets) {
      return [];
    }

    if (selectedMarketCategory == null) {
      return allMarkets;
    }

    return allMarkets.filter((item) =>
      item.market.categories.has(selectedMarketCategory),
    );
  }, [allMarkets, selectedMarketCategory]);

  const { results: queryFilteredMarkets } = useSearch({
    query,
    config: {
      items: marketsForProductType,
      searchKeys: [
        { name: 'market.marketName', weight: SEARCH_WEIGHTS.HIGH },
        {
          name: 'market.altSearchTerms',
          weight: SEARCH_WEIGHTS.MEDIUM,
        },
      ],
    },
  });

  const displayedMarkets: MarketSwitcherItem[] = useMemo(() => {
    return queryFilteredMarkets.sort(volumeComparator);
  }, [queryFilteredMarkets]);

  const selectedMarket = useMemo(() => {
    return allMarkets?.find((item) => item.productId === productId);
  }, [allMarkets, productId]);

  const disableMarketSwitcherButton = !allMarkets || !allMarkets.length;

  return {
    allMarkets,
    displayedMarkets,
    isLoading: isLoadingMarketsStaticData,
    toggleIsFavoritedMarket,
    selectedMarketCategory,
    setSelectedMarketCategory,
    query,
    setQuery,
    disableFavoriteButton: !isConnected,
    selectedMarket,
    isMarketSwitcherOpen,
    disableMarketSwitcherButton,
    setIsMarketSwitcherOpen,
  };
}
