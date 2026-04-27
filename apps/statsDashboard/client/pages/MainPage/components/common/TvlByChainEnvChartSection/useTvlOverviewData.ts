import { removeDecimals } from '@nadohq/client';
import { useEdgeMarketSnapshotsAtHistoricalTimes } from 'client/hooks/useEdgeMarketSnapshotsAtHistoricalTimes';
import { calcTotalDecimalAdjustedDeltas } from 'client/utils/calcTotalDecimalAdjustedDeltas';
import { getAverageOraclePricesByProductId } from 'client/utils/getAverageOraclePricesByProductId';
import { getValuesInPrimaryQuoteByProductId } from 'client/utils/getValuesInPrimaryQuoteByProductId';
import { useMemo } from 'react';

export function useTvlOverviewData() {
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

    const avgOraclePricesByProductId = getAverageOraclePricesByProductId(
      edgeMarketSnapshotAtNow?.oraclePrices,
      edgeMarketSnapshotAt24h?.oraclePrices,
    );

    const edgeTvlAtNowUsd = removeDecimals(edgeMarketSnapshotAtNow?.tvl);

    const edgeDeposits24hUsd = calcTotalDecimalAdjustedDeltas(
      getValuesInPrimaryQuoteByProductId(
        edgeMarketSnapshotAtNow?.cumulativeInflows,
        avgOraclePricesByProductId,
      ),
      getValuesInPrimaryQuoteByProductId(
        edgeMarketSnapshotAt24h?.cumulativeInflows,
        avgOraclePricesByProductId,
      ),
    );

    const edgeWithdrawals24hUsd = calcTotalDecimalAdjustedDeltas(
      getValuesInPrimaryQuoteByProductId(
        edgeMarketSnapshotAtNow?.cumulativeOutflows,
        avgOraclePricesByProductId,
      ),
      getValuesInPrimaryQuoteByProductId(
        edgeMarketSnapshotAt24h?.cumulativeOutflows,
        avgOraclePricesByProductId,
      ),
    );

    return {
      edgeTvlAtNowUsd,
      edgeDeposits24hUsd,
      edgeWithdrawals24hUsd,
    };
  }, [marketSnapshotsAtHistoricalTimesData]);

  return {
    data: mappedData,
    isLoading: isLoadingMarketSnapshotsAtHistoricalTimesData,
  };
}
