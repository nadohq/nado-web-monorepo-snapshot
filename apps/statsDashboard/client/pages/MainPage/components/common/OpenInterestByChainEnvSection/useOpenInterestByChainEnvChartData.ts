import { ChainEnvWithEdge, useEdgeMarketSnapshots } from '@nadohq/react-client';
import { ChainEnvBreakdownStatsChartDataItem } from 'client/components/charts/ChainEnvBreakdownStatsChart/types';
import { useChartTimeframe } from 'client/hooks/useChartTimeframe';
import { calcTotalDecimalAdjustedValue } from 'client/utils/calcTotalDecimalAdjustedValue';
import { useMemo } from 'react';

export function useOpenInterestByChainEnvChartData() {
  const { granularity, queryLimit } = useChartTimeframe();

  const {
    data: edgeMarketSnapshotsData,
    isLoading: isLoadingEdgeMarketSnapshotsData,
  } = useEdgeMarketSnapshots({
    granularity,
    limit: queryLimit,
  });

  const mappedData = useMemo(() => {
    if (!edgeMarketSnapshotsData) {
      return;
    }

    const openInterestByTimestamp: Record<
      number,
      ChainEnvBreakdownStatsChartDataItem
    > = {};

    Object.entries(edgeMarketSnapshotsData).forEach(([chainEnv, snapshots]) => {
      const chainEnvWithEdge = chainEnv as ChainEnvWithEdge;

      snapshots.forEach((currentSnapshot) => {
        if (!currentSnapshot) {
          return;
        }

        const currentTimestampMillis = currentSnapshot.timestamp
          .times(1000)
          .toNumber();

        const earlierTimestampMillis = currentSnapshot.timestamp
          .minus(granularity)
          .times(1000)
          .toNumber();

        const openInterestQuoteUsd = calcTotalDecimalAdjustedValue(
          currentSnapshot.openInterestsQuote,
        );

        openInterestByTimestamp[currentTimestampMillis] = {
          data: {
            ...openInterestByTimestamp[currentTimestampMillis]?.data,
            [chainEnvWithEdge]: openInterestQuoteUsd.toNumber(),
          },
          currentTimestampMillis,
          earlierTimestampMillis,
        };
      });
    });

    return {
      openInterests: Object.values(openInterestByTimestamp),
    };
  }, [edgeMarketSnapshotsData, granularity]);

  return {
    data: mappedData,
    isLoading: isLoadingEdgeMarketSnapshotsData,
  };
}
