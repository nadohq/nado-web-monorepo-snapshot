import { useEdgeMarketSnapshots } from '@nadohq/react-client';
import { StatsChartDataItem } from 'client/components/charts/StatsChart/types';
import { useChartTimeframe } from 'client/hooks/useChartTimeframe';
import { getTotalTradingFeesByProductId } from 'client/pages/MainPage/components/RevenueAndUsersTabContent/utils/getTotalTradingFeesByProductId';
import { calcTotalDecimalAdjustedDeltas } from 'client/utils/calcTotalDecimalAdjustedDeltas';
import { processIndexerMarketSnapshots } from 'client/utils/processIndexerMarketSnapshots';
import { useMemo } from 'react';

interface NetTradingFeesStatsChartDataItem extends StatsChartDataItem<
  'takerTradingFeesUsd' | 'makerTradingFeesUsd' | 'netTradingFeesUsd'
> {}

export function useEdgeNetTradingFeesChartSectionData() {
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

    const netTradingFeesUsd: NetTradingFeesStatsChartDataItem[] = [];

    processIndexerMarketSnapshots(
      edgeMarketSnapshotsData.edge,
      (
        currentSnapshot,
        earlierSnapshot,
        currentTimestampMillis,
        earlierTimestampMillis,
      ) => {
        const makerTradingFeesUsd = calcTotalDecimalAdjustedDeltas(
          currentSnapshot.cumulativeMakerFees,
          earlierSnapshot.cumulativeMakerFees,
        );

        const takerTradingFeesUsd = calcTotalDecimalAdjustedDeltas(
          getTotalTradingFeesByProductId(currentSnapshot),
          getTotalTradingFeesByProductId(earlierSnapshot),
        );

        const totalNetTradingFeesUsd =
          takerTradingFeesUsd.plus(makerTradingFeesUsd);

        netTradingFeesUsd.push({
          data: {
            takerTradingFeesUsd: takerTradingFeesUsd.toNumber(),
            makerTradingFeesUsd: makerTradingFeesUsd.toNumber(),
            netTradingFeesUsd: totalNetTradingFeesUsd.toNumber(),
          },
          currentTimestampMillis,
          earlierTimestampMillis,
        });
      },
    );

    return {
      netTradingFeesUsd,
    };
  }, [edgeMarketSnapshotsData]);

  return {
    data: mappedData,
    isLoading: isLoadingEdgeMarketSnapshotsData,
  };
}
