import { useQueryAllEdgeMarkets } from 'client/hooks/query/useQueryAllEdgeMarkets';
import { useEdgeMarketSnapshotsAtHistoricalTimes } from 'client/hooks/useEdgeMarketSnapshotsAtHistoricalTimes';
import { calcTotalDecimalAdjustedDeltas } from 'client/utils/calcTotalDecimalAdjustedDeltas';
import { calcTotalDecimalAdjustedValue } from 'client/utils/calcTotalDecimalAdjustedValue';
import { getVolumesInPrimaryQuoteByProductId } from 'client/utils/getVolumesInPrimaryQuoteByProductId';
import { useMemo } from 'react';

export function useEdgeVolumeOverviewData() {
  const { data: allEdgeMarketsData } = useQueryAllEdgeMarkets();

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

    const cumulativeVolumesAtNowUsd = getVolumesInPrimaryQuoteByProductId(
      edgeMarketSnapshotAtNow?.cumulativeVolumes,
      allEdgeMarketsData,
    );

    const cumulativeVolumesAt24hUsd = getVolumesInPrimaryQuoteByProductId(
      edgeMarketSnapshotAt24h?.cumulativeVolumes,
      allEdgeMarketsData,
    );

    const edgeTotalVolume24hUsd = calcTotalDecimalAdjustedDeltas(
      cumulativeVolumesAtNowUsd,
      cumulativeVolumesAt24hUsd,
    );

    const edgeTotalVolumeAllTimeUsd = calcTotalDecimalAdjustedValue(
      cumulativeVolumesAtNowUsd,
    );

    return {
      edgeTotalVolume24hUsd,
      edgeTotalVolumeAllTimeUsd,
    };
  }, [allEdgeMarketsData, marketSnapshotsAtHistoricalTimesData]);

  return {
    data: mappedData,
    isLoading: isLoadingMarketSnapshotsAtHistoricalTimesData,
  };
}
