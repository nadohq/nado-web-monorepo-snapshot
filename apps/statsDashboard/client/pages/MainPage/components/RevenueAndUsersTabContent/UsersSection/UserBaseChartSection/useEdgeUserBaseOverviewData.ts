import { safeDiv } from '@nadohq/react-client';
import { useEdgeMarketSnapshotsAtHistoricalTimes } from 'client/hooks/useEdgeMarketSnapshotsAtHistoricalTimes';
import { getTotalTradingFeesByProductId } from 'client/pages/MainPage/components/RevenueAndUsersTabContent/utils/getTotalTradingFeesByProductId';
import { calcTotalDecimalAdjustedValue } from 'client/utils/calcTotalDecimalAdjustedValue';
import { useMemo } from 'react';

export function useEdgeUserBaseOverviewData() {
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

    const edgeNewUsers24h = edgeMarketSnapshotAt24h
      ? edgeMarketSnapshotAtNow?.cumulativeUsers?.minus(
          edgeMarketSnapshotAt24h.cumulativeUsers,
        )
      : undefined;

    const edgeTotalUsers = edgeMarketSnapshotAtNow?.cumulativeUsers;

    const edgeTotalFeesUsd = calcTotalDecimalAdjustedValue(
      getTotalTradingFeesByProductId(edgeMarketSnapshotAtNow),
    );

    // Total edge cumulative fees / number of edge total users.
    const edgeAvgUserFeesUsd = (() => {
      if (!edgeTotalFeesUsd || !edgeTotalUsers) {
        return;
      }

      return safeDiv(edgeTotalFeesUsd, edgeTotalUsers);
    })();

    return {
      edgeNewUsers24h,
      edgeTotalUsers,
      edgeAvgUserFeesUsd,
    };
  }, [marketSnapshotsAtHistoricalTimesData]);

  return {
    data: mappedData,
    isLoading: isLoadingMarketSnapshotsAtHistoricalTimesData,
  };
}
