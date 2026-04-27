import { useEdgeMarketSnapshotsAtHistoricalTimes } from 'client/hooks/useEdgeMarketSnapshotsAtHistoricalTimes';
import { getTotalTradingFeesByProductId } from 'client/pages/MainPage/components/RevenueAndUsersTabContent/utils/getTotalTradingFeesByProductId';
import { calcTotalDecimalAdjustedDeltas } from 'client/utils/calcTotalDecimalAdjustedDeltas';
import { calcTotalDecimalAdjustedValue } from 'client/utils/calcTotalDecimalAdjustedValue';
import { useMemo } from 'react';

export function useEdgeTradingFeesOverviewData() {
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

    const totalTradingFeesAtNowByProductId = getTotalTradingFeesByProductId(
      edgeMarketSnapshotAtNow,
    );

    const edgeTotalFeesAllTimeUsd = calcTotalDecimalAdjustedValue(
      totalTradingFeesAtNowByProductId,
    );

    const edgeTotalFees24hUsd = calcTotalDecimalAdjustedDeltas(
      totalTradingFeesAtNowByProductId,
      getTotalTradingFeesByProductId(edgeMarketSnapshotAt24h),
    );

    return {
      edgeTotalFeesAllTimeUsd,
      edgeTotalFees24hUsd,
    };
  }, [marketSnapshotsAtHistoricalTimesData]);

  return {
    data: mappedData,
    isLoading: isLoadingMarketSnapshotsAtHistoricalTimesData,
  };
}
