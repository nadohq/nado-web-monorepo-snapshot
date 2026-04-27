import { useEdgeMarketSnapshotsAtHistoricalTimes } from 'client/hooks/useEdgeMarketSnapshotsAtHistoricalTimes';
import { calcTotalDecimalAdjustedDeltas } from 'client/utils/calcTotalDecimalAdjustedDeltas';
import { calcTotalDecimalAdjustedValue } from 'client/utils/calcTotalDecimalAdjustedValue';
import { useMemo } from 'react';

export function useEdgeLiquidationsOverviewData() {
  const {
    data: marketSnapshotsAtHistoricalTimesData,
    isLoading: isLoadingMarketSnapshotsAtHistoricalTimesData,
  } = useEdgeMarketSnapshotsAtHistoricalTimes();

  const mappedData = useMemo(() => {
    if (!marketSnapshotsAtHistoricalTimesData) {
      return;
    }

    const edgeMarketSnapshotAtNow =
      marketSnapshotsAtHistoricalTimesData.now.edge;
    const edgeMarketSnapshotAt24h =
      marketSnapshotsAtHistoricalTimesData['24h'].edge;

    const edgeLiquidationsAllTimeUsd = calcTotalDecimalAdjustedValue(
      edgeMarketSnapshotAtNow?.cumulativeLiquidationAmounts,
    );

    const edgeLiquidations24hUsd = calcTotalDecimalAdjustedDeltas(
      edgeMarketSnapshotAtNow?.cumulativeLiquidationAmounts,
      edgeMarketSnapshotAt24h?.cumulativeLiquidationAmounts,
    );

    return {
      edgeLiquidationsAllTimeUsd,
      edgeLiquidations24hUsd,
    };
  }, [marketSnapshotsAtHistoricalTimesData]);

  return {
    data: mappedData,
    isLoading: isLoadingMarketSnapshotsAtHistoricalTimesData,
  };
}
