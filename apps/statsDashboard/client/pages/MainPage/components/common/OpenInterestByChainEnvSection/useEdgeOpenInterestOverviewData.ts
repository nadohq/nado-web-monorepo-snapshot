import { removeDecimals } from '@nadohq/client';
import { nonNullFilter } from '@nadohq/web-common';
import { useQueryAllEdgeMarkets } from 'client/hooks/query/useQueryAllEdgeMarkets';
import { useEdgeMarketSnapshotsAtHistoricalTimes } from 'client/hooks/useEdgeMarketSnapshotsAtHistoricalTimes';
import { calcAllProductsTotalValue } from 'client/utils/calcAllProductsTotalValue';
import { getMarketName } from 'client/utils/getMarketName';
import { mapValues, sortBy } from 'lodash';
import { useMemo } from 'react';

export function useEdgeOpenInterestOverviewData() {
  const { data: allEdgeMarketsData } = useQueryAllEdgeMarkets();

  const {
    data: marketSnapshotsAtHistoricalTimesData,
    isLoading: isLoadingMarketSnapshotsAtHistoricalTimesData,
  } = useEdgeMarketSnapshotsAtHistoricalTimes();

  const mappedData = useMemo(() => {
    if (!marketSnapshotsAtHistoricalTimesData || !allEdgeMarketsData) {
      return;
    }

    const edgeMarketSnapshotAtNow =
      marketSnapshotsAtHistoricalTimesData.now.edge;

    const openInterestsQuoteByMarketUsd = mapValues(
      edgeMarketSnapshotAtNow?.openInterestsQuote,
      (value) => removeDecimals(value),
    );

    const edgeOpenInterestQuoteAtNowUsd = calcAllProductsTotalValue(
      openInterestsQuoteByMarketUsd,
    );

    const topOpenInterestsUsd = sortBy(
      Object.entries(openInterestsQuoteByMarketUsd),
      // Sort by value in descending order. (highest to lowest)
      ([, value]) => -value.toNumber(),
    )
      // Take only top 2.
      .slice(0, 2)
      // Map array of name, value. To be displayed on StatsValueWithLabel.
      .map(([productId, value]) => {
        const productIdAsNum = Number(productId);
        const market = allEdgeMarketsData.perpMarkets[productIdAsNum];

        if (!market) {
          return;
        }

        return {
          name: `${getMarketName(market)} OI`,
          value,
        };
      })
      .filter(nonNullFilter);

    return {
      topOpenInterestsUsd,
      edgeOpenInterestQuoteAtNowUsd,
    };
  }, [allEdgeMarketsData, marketSnapshotsAtHistoricalTimesData]);

  return {
    data: mappedData,
    isLoading: isLoadingMarketSnapshotsAtHistoricalTimesData,
  };
}
