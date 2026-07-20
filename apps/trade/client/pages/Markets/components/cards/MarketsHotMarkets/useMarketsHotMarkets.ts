import { removeDecimals } from '@nadohq/client';
import { useNadoMetadataContext } from '@nadohq/react-client';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { useAllMarketsStats } from 'client/hooks/markets/useAllMarketsStats';
import { sortByValueAndLimit } from 'client/pages/Markets/utils/sortByValueAndLimit';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import { useMemo } from 'react';

/**
 * The top 6 hottest markets based on daily quote volume in descending order
 */
export function useMarketsHotMarkets() {
  const { data: allMarkets, isLoading: isLoadingAllMarkets } = useAllMarkets();
  const { data: marketStats } = useAllMarketsStats();
  const { getIsHiddenMarket } = useNadoMetadataContext();

  const hotMarkets = useMemo(() => {
    if (!allMarkets?.allMarkets || !marketStats?.statsByMarket) {
      return;
    }

    const mappedMarkets = Object.values(allMarkets.allMarkets)
      .filter(
        (market) =>
          !getIsHiddenMarket(market.productId) &&
          marketStats.statsByMarket[market.productId],
      )
      .map((market) => {
        const past24hDailyVolumeUsd = removeDecimals(
          marketStats.statsByMarket[market.productId]
            .pastDayVolumeInPrimaryQuote,
        );

        return {
          past24hDailyVolumeUsd,
          metadata: getSharedProductMetadata(market.metadata),
          productId: market.productId,
        };
      });
    return sortByValueAndLimit(mappedMarkets, 'past24hDailyVolumeUsd');
  }, [allMarkets, marketStats, getIsHiddenMarket]);

  return {
    hotMarkets,
    isLoading: isLoadingAllMarkets || !marketStats,
  };
}
