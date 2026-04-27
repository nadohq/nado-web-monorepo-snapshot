import { removeDecimals } from '@nadohq/client';
import { ChainEnvWithEdge, useEdgeMarketSnapshots } from '@nadohq/react-client';
import { ChainEnvBreakdownStatsChartDataItem } from 'client/components/charts/ChainEnvBreakdownStatsChart/types';
import { useChartTimeframe } from 'client/hooks/useChartTimeframe';
import { useMemo } from 'react';

export function useTvlByChainEnvChartData() {
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

    const tvlUsdByTimestamp: Record<
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

        const decimalAdjustedTvl = removeDecimals(currentSnapshot.tvl);

        tvlUsdByTimestamp[currentTimestampMillis] = {
          data: {
            ...tvlUsdByTimestamp[currentTimestampMillis]?.data,
            [chainEnvWithEdge]: decimalAdjustedTvl.toNumber(),
          },
          currentTimestampMillis,
          earlierTimestampMillis,
        };
      });
    });

    return {
      tvlUsd: Object.values(tvlUsdByTimestamp),
    };
  }, [edgeMarketSnapshotsData, granularity]);

  return {
    data: mappedData,
    isLoading: isLoadingEdgeMarketSnapshotsData,
  };
}
