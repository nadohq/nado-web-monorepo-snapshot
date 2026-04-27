import { removeDecimals } from '@nadohq/client';
import { useQueryAllEdgeMarkets } from 'client/hooks/query/useQueryAllEdgeMarkets';
import { useEdgeMarketSnapshotsAtHistoricalTimes } from 'client/hooks/useEdgeMarketSnapshotsAtHistoricalTimes';
import { getTotalTradingFeesByProductId } from 'client/pages/MainPage/components/RevenueAndUsersTabContent/utils/getTotalTradingFeesByProductId';
import { createPieChartDataForProducts } from 'client/utils/createPieChartDataForProducts';
import { mapValues } from 'lodash';
import { useMemo } from 'react';

export function useEdgeTradingFeesPieChartData() {
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

    const edgeFeesAllTimeByMarketUsd = createPieChartDataForProducts(
      allEdgeMarketsData,
      mapValues(
        getTotalTradingFeesByProductId(edgeMarketSnapshotAtNow),
        (value) => removeDecimals(value),
      ),
    );

    return {
      edgeFeesAllTimeByMarketUsd,
    };
  }, [allEdgeMarketsData, marketSnapshotsAtHistoricalTimesData]);

  return {
    data: mappedData,
    isLoading:
      isLoadingMarketSnapshotsAtHistoricalTimesData ||
      isLoadingAllEngineMarketsData,
  };
}
