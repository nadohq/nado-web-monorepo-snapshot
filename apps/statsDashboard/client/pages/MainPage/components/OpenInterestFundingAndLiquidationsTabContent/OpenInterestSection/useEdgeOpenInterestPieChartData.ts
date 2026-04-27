import { removeDecimals } from '@nadohq/client';
import { useQueryAllEdgeMarkets } from 'client/hooks/query/useQueryAllEdgeMarkets';
import { useEdgeMarketSnapshotsAtHistoricalTimes } from 'client/hooks/useEdgeMarketSnapshotsAtHistoricalTimes';
import { createPieChartDataForProducts } from 'client/utils/createPieChartDataForProducts';
import { mapValues } from 'lodash';
import { useMemo } from 'react';

export function useEdgeOpenInterestPieChartData() {
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

    const edgeOpenInterestsAtNowByMarketUsd = createPieChartDataForProducts(
      allEdgeMarketsData,
      mapValues(edgeMarketSnapshotAtNow?.openInterestsQuote, (value) =>
        removeDecimals(value),
      ),
    );

    return {
      edgeOpenInterestsAtNowByMarketUsd,
    };
  }, [allEdgeMarketsData, marketSnapshotsAtHistoricalTimesData]);

  return {
    data: mappedData,
    isLoading:
      isLoadingMarketSnapshotsAtHistoricalTimesData ||
      isLoadingAllEngineMarketsData,
  };
}
