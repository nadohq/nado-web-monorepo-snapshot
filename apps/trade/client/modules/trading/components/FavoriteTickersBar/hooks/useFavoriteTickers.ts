import { KNOWN_PRODUCT_IDS } from '@nadohq/react-client';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { useAllMarketsStats } from 'client/hooks/markets/useAllMarketsStats';
import { useFavoritedMarkets } from 'client/hooks/markets/useFavoritedMarkets';
import { useQueryAllMarketsLatestPrices } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { useProductIdLinks } from 'client/hooks/ui/navigation/useProductIdLinks';
import { FavoriteTicker } from 'client/modules/trading/components/FavoriteTickersBar/types';
import { get } from 'lodash';
import { useCallback, useMemo } from 'react';

const DEFAULT_FAVORITE_PRODUCT_IDS = [
  KNOWN_PRODUCT_IDS.btcPerp,
  KNOWN_PRODUCT_IDS.ethPerp,
  KNOWN_PRODUCT_IDS.solPerp,
  KNOWN_PRODUCT_IDS.xrpPerp,
  KNOWN_PRODUCT_IDS.bnbPerp,
];

export interface UseFavoriteTickers {
  favoriteTickers: FavoriteTicker[];
  addDefaultFavorites: () => void;
}

export function useFavoriteTickers({
  activeProductId,
}: {
  activeProductId: number | undefined;
}): UseFavoriteTickers {
  const { data: allMarketsData } = useAllMarkets();
  const { data: latestMarketPricesData } = useQueryAllMarketsLatestPrices();
  const { data: marketStatsData } = useAllMarketsStats();
  const { favoritedMarketIds, toggleIsFavoritedMarket } = useFavoritedMarkets();
  const productIdLinks = useProductIdLinks();

  const favoriteTickers = useMemo(() => {
    if (!allMarketsData) {
      return [];
    }

    return Object.values(allMarketsData.allMarkets)
      .filter(
        (market) =>
          !market.isHidden && favoritedMarketIds.has(market.productId),
      )
      .map((market): FavoriteTicker => {
        const priceChangeFrac =
          marketStatsData?.statsByMarket[market.productId]
            ?.pastDayPriceChangeFrac;

        const currentPrice =
          latestMarketPricesData?.[market.productId]?.safeMidPrice;
        return {
          productId: market.productId,
          marketName: market.metadata.marketName,
          priceChangeFrac: priceChangeFrac,
          currentPrice: currentPrice,
          priceIncrement: market.priceIncrement,
          href: get(productIdLinks, market.productId, ''),
          isActive: activeProductId === market.productId,
        };
      });
  }, [
    allMarketsData,
    favoritedMarketIds,
    marketStatsData?.statsByMarket,
    latestMarketPricesData,
    productIdLinks,
    activeProductId,
  ]);

  const addDefaultFavorites = useCallback(() => {
    if (favoriteTickers.length > 0) return;

    DEFAULT_FAVORITE_PRODUCT_IDS.forEach((productId) => {
      toggleIsFavoritedMarket(productId);
    });
  }, [favoriteTickers.length, toggleIsFavoritedMarket]);

  return {
    favoriteTickers,
    addDefaultFavorites,
  };
}
