import { useEdgeMarketSnapshots } from '@nadohq/react-client';
import { StatsChartDataItem } from 'client/components/charts/StatsChart/types';
import { useChartTimeframe } from 'client/hooks/useChartTimeframe';
import { calcTotalDecimalAdjustedDeltas } from 'client/utils/calcTotalDecimalAdjustedDeltas';
import { getAverageOraclePricesByProductId } from 'client/utils/getAverageOraclePricesByProductId';
import { getValuesInPrimaryQuoteByProductId } from 'client/utils/getValuesInPrimaryQuoteByProductId';
import { processIndexerMarketSnapshots } from 'client/utils/processIndexerMarketSnapshots';
import { useMemo } from 'react';

interface EdgeFlowsStatsChartDataItem extends StatsChartDataItem<
  'depositsUsd' | 'withdrawalsUsd' | 'netFlowsUsd'
> {}

export function useEdgeFlowsChartData() {
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

    const flowsUsd: EdgeFlowsStatsChartDataItem[] = [];

    processIndexerMarketSnapshots(
      edgeMarketSnapshotsData.edge,
      (
        currentSnapshot,
        earlierSnapshot,
        currentTimestampMillis,
        earlierTimestampMillis,
      ) => {
        const avgOraclePricesByProductId = getAverageOraclePricesByProductId(
          currentSnapshot.oraclePrices,
          earlierSnapshot.oraclePrices,
        );

        const decimalAdjustedDepositsDelta = calcTotalDecimalAdjustedDeltas(
          getValuesInPrimaryQuoteByProductId(
            currentSnapshot.cumulativeInflows,
            avgOraclePricesByProductId,
          ),
          getValuesInPrimaryQuoteByProductId(
            earlierSnapshot.cumulativeInflows,
            avgOraclePricesByProductId,
          ),
        );

        const decimalAdjustedWithdrawalsDelta = calcTotalDecimalAdjustedDeltas(
          getValuesInPrimaryQuoteByProductId(
            currentSnapshot.cumulativeOutflows,
            avgOraclePricesByProductId,
          ),
          getValuesInPrimaryQuoteByProductId(
            earlierSnapshot.cumulativeOutflows,
            avgOraclePricesByProductId,
          ),
        );

        const netFlowsUsd = decimalAdjustedDepositsDelta.plus(
          decimalAdjustedWithdrawalsDelta,
        );

        flowsUsd.push({
          data: {
            netFlowsUsd: netFlowsUsd.toNumber(),
            depositsUsd: decimalAdjustedDepositsDelta.toNumber(),
            withdrawalsUsd: decimalAdjustedWithdrawalsDelta.toNumber(),
          },
          currentTimestampMillis,
          earlierTimestampMillis,
        });
      },
    );

    return {
      flowsUsd,
    };
  }, [edgeMarketSnapshotsData]);

  return {
    data: mappedData,
    isLoading: isLoadingEdgeMarketSnapshotsData,
  };
}
