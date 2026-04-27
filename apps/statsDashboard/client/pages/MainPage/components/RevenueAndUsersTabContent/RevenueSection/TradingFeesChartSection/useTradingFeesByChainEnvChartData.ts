import { ChainEnvWithEdge, useEdgeMarketSnapshots } from '@nadohq/react-client';
import { ChainEnvBreakdownStatsChartDataItem } from 'client/components/charts/ChainEnvBreakdownStatsChart/types';
import { useChartTimeframe } from 'client/hooks/useChartTimeframe';
import { getTotalTradingFeesByProductId } from 'client/pages/MainPage/components/RevenueAndUsersTabContent/utils/getTotalTradingFeesByProductId';
import { calcTotalDecimalAdjustedDeltas } from 'client/utils/calcTotalDecimalAdjustedDeltas';
import { calcTotalDecimalAdjustedValue } from 'client/utils/calcTotalDecimalAdjustedValue';
import { processIndexerMarketSnapshots } from 'client/utils/processIndexerMarketSnapshots';
import { useMemo } from 'react';

export function useTradingFeesByChainEnvChartData() {
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

    const feesUsdByTimestamp: Record<
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
          const earlierTotalTradingFeesByProductId =
            getTotalTradingFeesByProductId(earlierSnapshot);

          const currentTotalTradingFeesByProductId =
            getTotalTradingFeesByProductId(currentSnapshot);

          // Decimal Adjusted delta value (daily / monthly)
          const decimalAdjustedDelta = calcTotalDecimalAdjustedDeltas(
            currentTotalTradingFeesByProductId,
            earlierTotalTradingFeesByProductId,
          );

          feesUsdByTimestamp[currentTimestampMillis] = {
            data: {
              ...feesUsdByTimestamp[currentTimestampMillis]?.data,
              [chainEnvWithEdge]: decimalAdjustedDelta.toNumber(),
              ...(chainEnvWithEdge === 'edge'
                ? {
                    edgeCumulative: calcTotalDecimalAdjustedValue(
                      currentTotalTradingFeesByProductId,
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
      feesUsd: Object.values(feesUsdByTimestamp),
    };
  }, [edgeMarketSnapshotsData]);

  return {
    data: mappedData,
    isLoading: isLoadingEdgeMarketSnapshotsData,
  };
}
