import { IndexerSnapshotsIntervalParams } from '@nadohq/client';
import {
  calcAnnualizedInterestRate,
  useEdgeMarketSnapshots,
  useEVMContext,
} from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { secondsToMilliseconds } from 'date-fns';
import { get } from 'lodash';
import { useMemo } from 'react';

interface Params {
  productId: number;
  snapshotQueryParams: IndexerSnapshotsIntervalParams;
}

export interface HistoricalInterestRateChartDataItem {
  timestampMillis: number;
  borrowApyFraction: number | undefined;
  depositApyFraction: number | undefined;
}

export function useHistoricalInterestRateChartData({
  productId,
  snapshotQueryParams,
}: Params) {
  const { primaryChainEnv } = useEVMContext();

  const {
    data: edgeMarketSnapshotsData,
    isLoading: isLoadingEdgeMarketSnapshotsData,
  } = useEdgeMarketSnapshots(snapshotQueryParams);

  const mappedData: HistoricalInterestRateChartDataItem[] | undefined =
    useMemo(() => {
      if (!edgeMarketSnapshotsData?.[primaryChainEnv]) {
        return;
      }

      return (
        edgeMarketSnapshotsData[primaryChainEnv]
          .map((currentSnapshot) => {
            if (!currentSnapshot) {
              return;
            }

            const timestampMillis = secondsToMilliseconds(
              currentSnapshot.timestamp.toNumber(),
            );

            const borrowApyFraction = calcAnnualizedInterestRate(
              get(currentSnapshot.borrowRates, productId, undefined),
            )?.toNumber();

            const depositApyFraction = calcAnnualizedInterestRate(
              get(currentSnapshot.depositRates, productId, undefined),
            )?.toNumber();

            return {
              borrowApyFraction,
              depositApyFraction,
              timestampMillis,
            };
          })
          .filter(nonNullFilter)
          // Data from query needs to be reversed so we have the most recent timestamps last.
          .reverse()
      );
    }, [edgeMarketSnapshotsData, primaryChainEnv, productId]);

  return {
    data: mappedData,
    isLoading: isLoadingEdgeMarketSnapshotsData,
  };
}
