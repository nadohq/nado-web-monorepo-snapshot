import { ChainEnvWithEdge, useEdgeMarketSnapshots } from '@nadohq/react-client';
import { ChainEnvBreakdownStatsChartDataItem } from 'client/components/charts/ChainEnvBreakdownStatsChart/types';
import { useQueryAllEdgeMarkets } from 'client/hooks/query/useQueryAllEdgeMarkets';
import { useChartTimeframe } from 'client/hooks/useChartTimeframe';
import { calcTotalDecimalAdjustedDeltas } from 'client/utils/calcTotalDecimalAdjustedDeltas';
import { calcTotalDecimalAdjustedValue } from 'client/utils/calcTotalDecimalAdjustedValue';
import { getVolumesInPrimaryQuoteByProductId } from 'client/utils/getVolumesInPrimaryQuoteByProductId';
import { processIndexerMarketSnapshots } from 'client/utils/processIndexerMarketSnapshots';
import { useMemo } from 'react';

export function useVolumeByChainEnvChartData() {
  const { data: allEdgeMarketsData, isLoading: isLoadingAllEdgeMarketsData } =
    useQueryAllEdgeMarkets();
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

    const volumesUsdByTimestamp: Record<
      number,
      ChainEnvBreakdownStatsChartDataItem
    > = {};

    Object.entries(edgeMarketSnapshotsData).forEach(([chainEnv, snapshots]) => {
      const chainEnvWithEdge = chainEnv as ChainEnvWithEdge;

      processIndexerMarketSnapshots(
        snapshots,
        (
          currentSnapshot,
          earlierSnapshot,
          currentTimestampMillis,
          earlierTimestampMillis,
        ) => {
          const earlierSnapshotCumulativeVolumesUsd =
            getVolumesInPrimaryQuoteByProductId(
              earlierSnapshot.cumulativeVolumes,
              allEdgeMarketsData,
            );

          const currentSnapshotCumulativeVolumesUsd =
            getVolumesInPrimaryQuoteByProductId(
              currentSnapshot.cumulativeVolumes,
              allEdgeMarketsData,
            );

          // Decimal adjusted delta value (daily / monthly)
          const decimalAdjustedDelta = calcTotalDecimalAdjustedDeltas(
            currentSnapshotCumulativeVolumesUsd,
            earlierSnapshotCumulativeVolumesUsd,
          );

          volumesUsdByTimestamp[currentTimestampMillis] = {
            data: {
              ...volumesUsdByTimestamp[currentTimestampMillis]?.data,
              [chainEnvWithEdge]: decimalAdjustedDelta.toNumber(),
              ...(chainEnvWithEdge === 'edge'
                ? {
                    edgeCumulative: calcTotalDecimalAdjustedValue(
                      currentSnapshotCumulativeVolumesUsd,
                    ).toNumber(),
                  }
                : {}),
            },
            currentTimestampMillis,
            earlierTimestampMillis,
          };
        },
      );
    });

    return {
      volumesUsd: Object.values(volumesUsdByTimestamp),
    };
  }, [allEdgeMarketsData, edgeMarketSnapshotsData]);

  return {
    data: mappedData,
    isLoading: isLoadingEdgeMarketSnapshotsData || isLoadingAllEdgeMarketsData,
  };
}
