import { useEdgeMarketSnapshots } from '@nadohq/react-client';
import { StatsChartDataItem } from 'client/components/charts/StatsChart/types';
import { useQueryAllEdgeMarkets } from 'client/hooks/query/useQueryAllEdgeMarkets';
import { useChartTimeframe } from 'client/hooks/useChartTimeframe';
import { calcTotalDecimalAdjustedDeltas } from 'client/utils/calcTotalDecimalAdjustedDeltas';
import { calcTotalDecimalAdjustedValue } from 'client/utils/calcTotalDecimalAdjustedValue';
import { getVolumesInPrimaryQuoteByProductId } from 'client/utils/getVolumesInPrimaryQuoteByProductId';
import { processIndexerMarketSnapshots } from 'client/utils/processIndexerMarketSnapshots';
import { pick } from 'lodash';
import { useMemo } from 'react';

interface PerpSpotStatsChartDataItem extends StatsChartDataItem<
  'spotVolumeUsd' | 'perpVolumeUsd'
> {}

interface CumulativePerpSpotStatsChartDataItem extends StatsChartDataItem<
  'spotVolumeUsd' | 'perpVolumeUsd' | 'totalVolumeUsd'
> {}

export function useEdgeSpotPerpVolumeChartsSectionData() {
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
    if (!edgeMarketSnapshotsData || !allEdgeMarketsData) {
      return;
    }

    const perpSpotVolumesUsd: PerpSpotStatsChartDataItem[] = [];
    const cumulativePerpSpotVolumesUsd: CumulativePerpSpotStatsChartDataItem[] =
      [];

    processIndexerMarketSnapshots(
      edgeMarketSnapshotsData.edge,
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

        const earlierSpotCumulativeVolumes = pick(
          earlierSnapshotCumulativeVolumesUsd,
          allEdgeMarketsData.spotMarketsProductIds,
        );
        const earlierPerpCumulativeVolumes = pick(
          earlierSnapshotCumulativeVolumesUsd,
          allEdgeMarketsData.perpMarketsProductIds,
        );

        const currentSpotCumulativeVolumes = pick(
          currentSnapshotCumulativeVolumesUsd,
          allEdgeMarketsData.spotMarketsProductIds,
        );

        const currentPerpCumulativeVolumes = pick(
          currentSnapshotCumulativeVolumesUsd,
          allEdgeMarketsData.perpMarketsProductIds,
        );

        const spotDeltaUsd = calcTotalDecimalAdjustedDeltas(
          currentSpotCumulativeVolumes,
          earlierSpotCumulativeVolumes,
        );

        const perpDeltaUsd = calcTotalDecimalAdjustedDeltas(
          currentPerpCumulativeVolumes,
          earlierPerpCumulativeVolumes,
        );

        perpSpotVolumesUsd.push({
          data: {
            spotVolumeUsd: spotDeltaUsd.toNumber(),
            perpVolumeUsd: perpDeltaUsd.toNumber(),
          },
          currentTimestampMillis,
          earlierTimestampMillis,
        });

        const currentCumulativeSpotVolumeUsd = calcTotalDecimalAdjustedValue(
          currentSpotCumulativeVolumes,
        );

        const currentCumulativePerpVolumeUsd = calcTotalDecimalAdjustedValue(
          currentPerpCumulativeVolumes,
        );

        const cumulativeTotalVolumeUsd = currentCumulativePerpVolumeUsd.plus(
          currentCumulativeSpotVolumeUsd,
        );

        cumulativePerpSpotVolumesUsd.push({
          data: {
            spotVolumeUsd: currentCumulativeSpotVolumeUsd.toNumber(),
            perpVolumeUsd: currentCumulativePerpVolumeUsd.toNumber(),
            totalVolumeUsd: cumulativeTotalVolumeUsd.toNumber(),
          },
          currentTimestampMillis,
          earlierTimestampMillis,
        });
      },
    );

    return {
      perpSpotVolumesUsd,
      cumulativePerpSpotVolumesUsd,
    };
  }, [allEdgeMarketsData, edgeMarketSnapshotsData]);

  return {
    data: mappedData,
    isLoading: isLoadingEdgeMarketSnapshotsData || isLoadingAllEdgeMarketsData,
  };
}
