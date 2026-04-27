import { ChainEnvWithEdge, useEdgeMarketSnapshots } from '@nadohq/react-client';
import { ChainEnvBreakdownStatsChartDataItem } from 'client/components/charts/ChainEnvBreakdownStatsChart/types';
import { useChartTimeframe } from 'client/hooks/useChartTimeframe';
import { calcTotalDecimalAdjustedValue } from 'client/utils/calcTotalDecimalAdjustedValue';
import { getValuesInPrimaryQuoteByProductId } from 'client/utils/getValuesInPrimaryQuoteByProductId';
import { useMemo } from 'react';

export function useDepositsByChainEnvChartData() {
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

    const depositsUsdByTimestamp: Record<
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

        const totalDepositsUsd = calcTotalDecimalAdjustedValue(
          getValuesInPrimaryQuoteByProductId(
            currentSnapshot.totalDeposits,
            currentSnapshot.oraclePrices,
          ),
        );

        depositsUsdByTimestamp[currentTimestampMillis] = {
          data: {
            ...depositsUsdByTimestamp[currentTimestampMillis]?.data,
            [chainEnvWithEdge]: totalDepositsUsd.toNumber(),
          },
          currentTimestampMillis,
          earlierTimestampMillis,
        };
      });
    });

    return {
      depositsUsd: Object.values(depositsUsdByTimestamp),
    };
  }, [edgeMarketSnapshotsData, granularity]);

  return {
    data: mappedData,
    isLoading: isLoadingEdgeMarketSnapshotsData,
  };
}
