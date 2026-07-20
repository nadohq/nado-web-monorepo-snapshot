import { ProductEngineType } from '@nadohq/client';
import { MarketCategory } from '@nadohq/react-client';
import { useAllMarketsPointsBoosts } from 'client/hooks/markets/useAllMarketsPointsBoosts';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useAllMarketsStats } from 'client/hooks/markets/useAllMarketsStats';
import { useFavoritedMarkets } from 'client/hooks/markets/useFavoritedMarkets';
import { useQueryAllMarkets24hFundingRates } from 'client/hooks/query/markets/useQueryAllMarkets24hFundingRates';
import { useQueryAllMarketsLatestPrices } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { useProductIdLinks } from 'client/hooks/ui/navigation/useProductIdLinks';
import { SEARCH_WEIGHTS } from 'client/hooks/ui/search/consts';
import { useSearch } from 'client/hooks/ui/search/useSearch';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { ROUTES } from 'client/modules/app/consts/routes';
import { useGetIsZeroFeesMarketForSubaccount } from 'client/modules/subaccounts/hooks/useGetIsZeroFeesMarketForSubaccount';
import { MarketSwitcherItem } from 'client/modules/trading/components/TradingMarketSwitcher/types';
import {
  getMappedMarket,
  volumeComparator,
} from 'client/modules/trading/components/TradingMarketSwitcher/utils';
import { useGetIsXStocksProduct } from 'client/modules/xStocks/hooks/useGetIsXStocksProduct';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
import { get } from 'lodash';
import { usePathname } from 'next/navigation';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

type ProductTypeFilterID = 'perps' | 'spot' | 'all';

type MarketCategoryFilterID = MarketCategory | 'all';

interface FilterOption<T extends string> {
  value: T;
  label: string;
}

export interface UseTradingMarketSwitcher {
  allMarkets: MarketSwitcherItem[] | undefined;
  isLoading: boolean;
  displayedMarkets: MarketSwitcherItem[];
  toggleIsFavoritedMarket: (marketId: number) => void;
  disableFavoriteButton: boolean;
  selectedMarket: MarketSwitcherItem | undefined;
  isMarketSwitcherOpen: boolean;
  disableMarketSwitcherButton: boolean;
  setIsMarketSwitcherOpen: (open: boolean) => void;
  query: string;
  setQuery: (query: string) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: Dispatch<SetStateAction<boolean>>;
  selectedProductTypeFilterId: ProductTypeFilterID;
  setSelectedProductTypeFilterId: (value: string) => void;
  productTypeFilterOptions: FilterOption<ProductTypeFilterID>[];
  selectedMarketCategoryFilterId: MarketCategoryFilterID;
  setSelectedMarketCategoryFilterId: (value: string) => void;
  marketCategoryFilterOptions: FilterOption<MarketCategoryFilterID>[];
  resetFilters: () => void;
}

export function useTradingMarketSwitcher(
  productId: number | undefined,
): UseTradingMarketSwitcher {
  const { t } = useTranslation();

  const [isMarketSwitcherOpen, setIsMarketSwitcherOpen] = useState(false);

  const isConnected = useIsConnected();

  const { data: allMarketsStaticData, isLoading: isLoadingMarketsStaticData } =
    useAllMarketsStaticData();
  const { data: latestMarketPricesData } = useQueryAllMarketsLatestPrices();
  const { data: marketStatsData } = useAllMarketsStats();
  const { favoritedMarketIds, toggleIsFavoritedMarket } = useFavoritedMarkets();
  const { data: fundingRatesData } = useQueryAllMarkets24hFundingRates();
  const { data: pointsBoostData } = useAllMarketsPointsBoosts();
  const { getExchangeRate } = useGetXStocksExchangeRate();
  const getIsXStocksProduct = useGetIsXStocksProduct();
  const { getIsZeroFeesMarketForSubaccount } =
    useGetIsZeroFeesMarketForSubaccount();

  const productIdLinks = useProductIdLinks();

  const allMarkets = useMemo(() => {
    if (!allMarketsStaticData) {
      return [];
    }

    return Object.values(allMarketsStaticData.allMarkets)
      .filter((market) => !market.isHidden)
      .map((market) =>
        getMappedMarket({
          market,
          latestMarketPrices: latestMarketPricesData,
          marketStats: marketStatsData,
          fundingRates: fundingRatesData,
          isFavoritedMarket: favoritedMarketIds.has(market.productId),
          href: get(productIdLinks, market.productId, undefined) ?? '',
          pointsBoost: get(pointsBoostData, market.productId, undefined),
          exchangeRate: getExchangeRate(market.productId),
          isXStock: getIsXStocksProduct(market.productId),
          isZeroFeesMarket: getIsZeroFeesMarketForSubaccount(market.productId),
        }),
      );
  }, [
    allMarketsStaticData,
    favoritedMarketIds,
    fundingRatesData,
    getExchangeRate,
    getIsXStocksProduct,
    getIsZeroFeesMarketForSubaccount,
    latestMarketPricesData,
    marketStatsData,
    productIdLinks,
    pointsBoostData,
  ]);

  const selectedMarket = useMemo(() => {
    return allMarkets?.find((item) => item.productId === productId);
  }, [allMarkets, productId]);

  const pathname = usePathname();
  const defaultSelectedProductTypeFilterId: ProductTypeFilterID = (() => {
    const isOnPerp = pathname.startsWith(ROUTES.perpTrading);
    if (isOnPerp) {
      return 'perps';
    }
    const isOnSpot = pathname.startsWith(ROUTES.spotTrading);
    if (isOnSpot) {
      return 'spot';
    }
    return 'all';
  })();

  const [query, setQuery] = useState('');

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [selectedProductTypeFilterId, setSelectedProductTypeFilterId] =
    useState<ProductTypeFilterID>(defaultSelectedProductTypeFilterId);

  const productTypeFilterOptions: FilterOption<ProductTypeFilterID>[] =
    useMemo(() => {
      return [
        {
          value: 'all',
          label: t(($) => $.all),
        },
        {
          value: 'perps',
          label: t(($) => $.perps),
        },
        {
          value: 'spot',
          label: t(($) => $.spot),
        },
      ];
    }, [t]);

  const [selectedMarketCategoryFilterId, setSelectedMarketCategoryFilterId] =
    useState<MarketCategoryFilterID>('all');

  const marketCategoryFilterOptions: FilterOption<MarketCategoryFilterID>[] =
    useMemo(() => {
      return [
        {
          value: 'all',
          label: t(($) => $.marketCategory.all),
        },
        {
          value: 'crypto',
          label: t(($) => $.marketCategory.crypto),
        },
        {
          value: 'commodities',
          label: t(($) => $.marketCategory.commodities),
        },
        {
          value: 'stocks',
          label: t(($) => $.marketCategory.stocks),
        },
        {
          value: 'forex',
          label: t(($) => $.marketCategory.forex),
        },
      ];
    }, [t]);

  const resetFilters = useCallback(() => {
    setQuery('');
    setShowFavoritesOnly(false);
    setSelectedProductTypeFilterId(defaultSelectedProductTypeFilterId);
    setSelectedMarketCategoryFilterId('all');
  }, [
    setQuery,
    setShowFavoritesOnly,
    setSelectedProductTypeFilterId,
    setSelectedMarketCategoryFilterId,
    defaultSelectedProductTypeFilterId,
  ]);

  const { results: queryFilteredMarkets } = useSearch({
    query,
    config: {
      items: allMarkets,
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
    return queryFilteredMarkets
      .filter((market) => {
        const matchesProductEngineTypeFilter = (() => {
          switch (selectedProductTypeFilterId) {
            case 'all':
              return true;
            case 'perps':
              return market.market.productType === ProductEngineType.PERP;
            case 'spot':
              return market.market.productType === ProductEngineType.SPOT;
            default:
              return false;
          }
        })();
        const matchesMarketCategoryFilter =
          selectedMarketCategoryFilterId === 'all' ||
          market.market.categories.has(selectedMarketCategoryFilterId);

        return (
          matchesProductEngineTypeFilter &&
          matchesMarketCategoryFilter &&
          (!showFavoritesOnly || market.isFavorited)
        );
      })
      .sort(volumeComparator);
  }, [
    queryFilteredMarkets,
    selectedProductTypeFilterId,
    selectedMarketCategoryFilterId,
    showFavoritesOnly,
  ]);

  const setUntypedProductTypeFilterId = useCallback(
    (productTypeFilterId: string) => {
      setSelectedProductTypeFilterId(
        productTypeFilterId as ProductTypeFilterID,
      );
    },
    [setSelectedProductTypeFilterId],
  );

  const setUntypedMarketCategoryFilterId = useCallback(
    (marketCategoryFilterId: string) => {
      setSelectedMarketCategoryFilterId(
        marketCategoryFilterId as MarketCategoryFilterID,
      );
    },
    [setSelectedMarketCategoryFilterId],
  );

  const disableMarketSwitcherButton = !allMarkets || !allMarkets.length;

  return {
    allMarkets,
    displayedMarkets,
    isLoading: isLoadingMarketsStaticData,
    toggleIsFavoritedMarket,
    showFavoritesOnly,
    setShowFavoritesOnly,
    selectedProductTypeFilterId,
    setSelectedProductTypeFilterId: setUntypedProductTypeFilterId,
    productTypeFilterOptions,
    selectedMarketCategoryFilterId,
    setSelectedMarketCategoryFilterId: setUntypedMarketCategoryFilterId,
    marketCategoryFilterOptions,
    query,
    setQuery,
    resetFilters,
    disableFavoriteButton: !isConnected,
    selectedMarket,
    isMarketSwitcherOpen,
    disableMarketSwitcherButton,
    setIsMarketSwitcherOpen,
  };
}
