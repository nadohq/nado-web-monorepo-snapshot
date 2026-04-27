import { ChainEnvWithEdge, useEdgeMarketSnapshots } from '@nadohq/react-client';
import { ChainEnvBreakdownStatsChartDataItem } from 'client/components/charts/ChainEnvBreakdownStatsChart/types';
import { useChartTimeframe } from 'client/hooks/useChartTimeframe';
import { calcTotalDecimalAdjustedDeltas } from 'client/utils/calcTotalDecimalAdjustedDeltas';
import { calcTotalDecimalAdjustedValue } from 'client/utils/calcTotalDecimalAdjustedValue';
import { processIndexerMarketSnapshots } from 'client/utils/processIndexerMarketSnapshots';
import { useMemo } from 'react';

export function useLiquidationsByChainEnvChartData() {
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

    const liquidationsByTimestamp: Record<
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
          const decimalAdjustedDeltaLiquidations =
            calcTotalDecimalAdjustedDeltas(
              currentSnapshot.cumulativeLiquidationAmounts,
              earlierSnapshot.cumulativeLiquidationAmounts,
            );

          liquidationsByTimestamp[currentTimestampMillis] = {
            data: {
              ...liquidationsByTimestamp[currentTimestampMillis]?.data,
              [chainEnvWithEdge]: decimalAdjustedDeltaLiquidations.toNumber(),
              ...(chainEnvWithEdge === 'edge'
                ? {
                    edgeCumulative: calcTotalDecimalAdjustedValue(
                      currentSnapshot.cumulativeLiquidationAmounts,
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
      liquidations: Object.values(liquidationsByTimestamp),
    };
  }, [edgeMarketSnapshotsData]);

  return {
    data: mappedData,
    isLoading: isLoadingEdgeMarketSnapshotsData,
  };
}
