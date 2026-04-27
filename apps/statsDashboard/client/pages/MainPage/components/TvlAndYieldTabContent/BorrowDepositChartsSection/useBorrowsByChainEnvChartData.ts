import { BigNumbers, NLP_PRODUCT_ID } from '@nadohq/client';
import { ChainEnvWithEdge, useEdgeMarketSnapshots } from '@nadohq/react-client';
import { ChainEnvBreakdownStatsChartDataItem } from 'client/components/charts/ChainEnvBreakdownStatsChart/types';
import { useChartTimeframe } from 'client/hooks/useChartTimeframe';
import { calcTotalDecimalAdjustedValue } from 'client/utils/calcTotalDecimalAdjustedValue';
import { getValuesInPrimaryQuoteByProductId } from 'client/utils/getValuesInPrimaryQuoteByProductId';
import { useMemo } from 'react';

export function useBorrowsByChainEnvChartData() {
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

    const borrowsUsdByTimestamp: Record<
      number,
      ChainEnvBreakdownStatsChartDataItem
    > = {};

    Object.entries(edgeMarketSnapshotsData).forEach(([chainEnv, snapshots]) => {
      const chainEnvWithEdge = chainEnv as ChainEnvWithEdge;

      snapshots.forEach((currentSnapshot) => {
        if (!currentSnapshot) {
          return;
        }

        const currentTimestampMillis = currentSnapshot.timestamp
          .times(1000)
          .toNumber();

        const earlierTimestampMillis = currentSnapshot.timestamp
          .minus(granularity)
          .times(1000)
          .toNumber();

        const decimalAdjustedTotalBorrows = calcTotalDecimalAdjustedValue(
          getValuesInPrimaryQuoteByProductId(
            {
              ...currentSnapshot.totalBorrows,
              // NLP is treated as special spot product so we need to set it to 0 to avoid including it in the chart
              [NLP_PRODUCT_ID]: BigNumbers.ZERO,
            },
            currentSnapshot.oraclePrices,
          ),
        );

        borrowsUsdByTimestamp[currentTimestampMillis] = {
          data: {
            ...borrowsUsdByTimestamp[currentTimestampMillis]?.data,
            [chainEnvWithEdge]: decimalAdjustedTotalBorrows.toNumber(),
          },
          currentTimestampMillis,
          earlierTimestampMillis,
        };
      });
    });

    return {
      borrowsUsd: Object.values(borrowsUsdByTimestamp),
    };
  }, [edgeMarketSnapshotsData, granularity]);

  return {
    data: mappedData,
    isLoading: isLoadingEdgeMarketSnapshotsData,
  };
}
