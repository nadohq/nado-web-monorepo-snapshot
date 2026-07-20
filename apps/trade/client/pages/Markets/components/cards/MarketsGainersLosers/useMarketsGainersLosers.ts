import { useNadoMetadataContext } from '@nadohq/react-client';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { useAllMarketsStats } from 'client/hooks/markets/useAllMarketsStats';
import { sortByValueAndLimit } from 'client/pages/Markets/utils/sortByValueAndLimit';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import { useMemo } from 'react';

/**
 * The top 3 gainers / 3 losers based on past day's change in descending order
 */
export function useMarketsGainersLosers() {
  const { data: allMarkets, isLoading: isAllMarketsLoading } = useAllMarkets();
  const { data: marketStats, isLoading: isMarketStatsLoading } =
    useAllMarketsStats();
  const { getIsHiddenMarket } = useNadoMetadataContext();

  return useMemo(() => {
    if (!allMarkets?.allMarkets || !marketStats?.statsByMarket) {
      return {
        gainers: [],
        losers: [],
        isLoading: isMarketStatsLoading || isAllMarketsLoading,
      };
    }

    const mappedMarkets = Object.values(allMarkets.allMarkets)
      .filter(
        (market) =>
          !getIsHiddenMarket(market.productId) &&
          marketStats.statsByMarket[market.productId],
      )
      .map((market) => {
        const productId = market.productId;

        return {
          metadata: getSharedProductMetadata(market.metadata),
          productId,
          pastDayPriceChangeFrac:
            marketStats.statsByMarket[productId].pastDayPriceChangeFrac,
        };
      });

    return {
      gainers: sortByValueAndLimit(mappedMarkets, 'pastDayPriceChangeFrac', {
        limit: 3,
      }),
      losers: sortByValueAndLimit(mappedMarkets, 'pastDayPriceChangeFrac', {
        isAscending: true,
        limit: 3,
      }),
      isLoading: isMarketStatsLoading || isAllMarketsLoading,
    };
  }, [
    getIsHiddenMarket,
    marketStats,
    allMarkets,
    isMarketStatsLoading,
    isAllMarketsLoading,
  ]);
}
