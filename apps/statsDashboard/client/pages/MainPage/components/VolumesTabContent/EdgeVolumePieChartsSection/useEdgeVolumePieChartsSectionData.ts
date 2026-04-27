import { removeDecimals } from '@nadohq/client';
import { useQueryAllEdgeMarkets } from 'client/hooks/query/useQueryAllEdgeMarkets';
import { useEdgeMarketSnapshotsAtHistoricalTimes } from 'client/hooks/useEdgeMarketSnapshotsAtHistoricalTimes';
import { calcTotalDecimalAdjustedDeltas } from 'client/utils/calcTotalDecimalAdjustedDeltas';
import { calcTotalDecimalAdjustedValue } from 'client/utils/calcTotalDecimalAdjustedValue';
import { createPieChartDataForProducts } from 'client/utils/createPieChartDataForProducts';
import { getDecimalAdjustedDeltasByProductId } from 'client/utils/getDecimalAdjustedDeltasByProductId';
import { getVolumesInPrimaryQuoteByProductId } from 'client/utils/getVolumesInPrimaryQuoteByProductId';
import { mapValues } from 'lodash';
import { useMemo } from 'react';

export function useEdgeVolumePieChartsSectionData() {
  const { data: allEdgeMarketsData, isLoading: isLoadingAllEngineMarketsData } =
    useQueryAllEdgeMarkets();

  const {
    data: marketSnapshotsAtHistoricalTimesData,
    isLoading: isLoadingMarketSnapshotsAtHistoricalTimesData,
  } = useEdgeMarketSnapshotsAtHistoricalTimes();

  const mappedData = useMemo(() => {
    if (!marketSnapshotsAtHistoricalTimesData || !allEdgeMarketsData) {
      return;
    }

    const edgeMarketSnapshotAtNow =
      marketSnapshotsAtHistoricalTimesData.now.edge;
    const edgeMarketSnapshotAt24h =
      marketSnapshotsAtHistoricalTimesData['24h'].edge;
    const edgeMarketSnapshotAt7d =
      marketSnapshotsAtHistoricalTimesData['7d'].edge;
    const edgeMarketSnapshotAt30d =
      marketSnapshotsAtHistoricalTimesData['30d'].edge;

    const cumulativeVolumesAtNowUsd = getVolumesInPrimaryQuoteByProductId(
      edgeMarketSnapshotAtNow?.cumulativeVolumes,
      allEdgeMarketsData,
    );

    const cumulativeVolumesAt24hUsd = getVolumesInPrimaryQuoteByProductId(
      edgeMarketSnapshotAt24h?.cumulativeVolumes,
      allEdgeMarketsData,
    );

    const cumulativeVolumesAt7dUsd = getVolumesInPrimaryQuoteByProductId(
      edgeMarketSnapshotAt7d?.cumulativeVolumes,
      allEdgeMarketsData,
    );

    const cumulativeVolumesAt30dUsd = getVolumesInPrimaryQuoteByProductId(
      edgeMarketSnapshotAt30d?.cumulativeVolumes,
      allEdgeMarketsData,
    );

    // Calculate total volumes for PieCharts
    const edgeTotalVolume24hUsd = calcTotalDecimalAdjustedDeltas(
      cumulativeVolumesAtNowUsd,
      cumulativeVolumesAt24hUsd,
    );

    const edgeTotalVolume7dUsd = calcTotalDecimalAdjustedDeltas(
      cumulativeVolumesAtNowUsd,
      cumulativeVolumesAt7dUsd,
    );
    const edgeTotalVolume30dUsd = calcTotalDecimalAdjustedDeltas(
      cumulativeVolumesAtNowUsd,
      cumulativeVolumesAt30dUsd,
    );
    const edgeTotalVolumeAllTimeUsd = calcTotalDecimalAdjustedValue(
      cumulativeVolumesAtNowUsd,
    );

    // Map edge volumes by market to PieCharts.
    const edgeVolumes24hByMarketUsd = createPieChartDataForProducts(
      allEdgeMarketsData,
      getDecimalAdjustedDeltasByProductId(
        cumulativeVolumesAtNowUsd,
        cumulativeVolumesAt24hUsd,
      ),
    );
    const edgeVolumes7dByMarketUsd = createPieChartDataForProducts(
      allEdgeMarketsData,
      getDecimalAdjustedDeltasByProductId(
        cumulativeVolumesAtNowUsd,
        cumulativeVolumesAt7dUsd,
      ),
    );
    const edgeVolumes30dByMarketUsd = createPieChartDataForProducts(
      allEdgeMarketsData,
      getDecimalAdjustedDeltasByProductId(
        cumulativeVolumesAtNowUsd,
        cumulativeVolumesAt30dUsd,
      ),
    );
    const edgeVolumesAllTimeByMarketUsd = createPieChartDataForProducts(
      allEdgeMarketsData,
      mapValues(cumulativeVolumesAtNowUsd, (value) => removeDecimals(value)),
    );

    return {
      edgeTotalVolume24hUsd,
      edgeTotalVolume7dUsd,
      edgeTotalVolume30dUsd,
      edgeTotalVolumeAllTimeUsd,
      edgeVolumes24hByMarketUsd,
      edgeVolumes7dByMarketUsd,
      edgeVolumes30dByMarketUsd,
      edgeVolumesAllTimeByMarketUsd,
    };
  }, [allEdgeMarketsData, marketSnapshotsAtHistoricalTimesData]);

  return {
    data: mappedData,
    isLoading:
      isLoadingMarketSnapshotsAtHistoricalTimesData ||
      isLoadingAllEngineMarketsData,
  };
}
