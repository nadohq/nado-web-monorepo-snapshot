import { TimeInSeconds } from '@nadohq/client';
import { getFundingRates, useEdgeMarketSnapshots } from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { useQueryAllMarkets24hFundingRates } from 'client/hooks/query/markets/useQueryAllMarkets24hFundingRates';
import { useFundingRatePeriod } from 'client/modules/trading/hooks/useFundingRatePeriod';
import { secondsToMilliseconds } from 'date-fns';
import { useMemo } from 'react';

export interface FundingChartItem {
  timestampMillis: number;
  fundingRate: number;
}

interface Params {
  productId: number | undefined;
}

export function useFundingChart({ productId }: Params) {
  const { fundingRatePeriod } = useFundingRatePeriod();

  const {
    data: edgeMarketSnapshotsData,
    isLoading: isLoadingEdgeMarketSnapshotsData,
  } = useEdgeMarketSnapshots({
    granularity: TimeInSeconds.HOUR,
    limit: 30,
    disabled: productId == null,
  });
  const { data: currentFundingRates } = useQueryAllMarkets24hFundingRates();

  const predictedFundingRates = useMemo(() => {
    if (!productId || !currentFundingRates) {
      return;
    }
    return getFundingRates(currentFundingRates[productId].fundingRate);
  }, [currentFundingRates, productId]);

  const mappedFundingRates = useMemo((): FundingChartItem[] => {
    if (!productId || !edgeMarketSnapshotsData) {
      return [];
    }

    return (
      edgeMarketSnapshotsData.edge
        .map((currentSnapshot) => {
          const timestampMillis = secondsToMilliseconds(
            currentSnapshot.timestamp.toNumber(),
          );

          const fundingRate = (() => {
            const snapshotFundingRate = currentSnapshot.fundingRates[productId];

            if (!snapshotFundingRate) {
              return 0;
            }

            // Funding rate from market snapshots is an hourly average and `getFundingRates` is based on a daily figure
            const fundingRates = getFundingRates(
              snapshotFundingRate.multipliedBy(24),
            );

            return fundingRates[fundingRatePeriod].toNumber();
          })();

          return {
            timestampMillis,
            fundingRate,
          };
        })
        .filter(nonNullFilter)
        // Data from query needs to be reversed so we have the most recent timestamps last.
        .reverse()
    );
  }, [edgeMarketSnapshotsData, productId, fundingRatePeriod]);

  return {
    mappedFundingRates,
    predictedFundingRate: predictedFundingRates?.[fundingRatePeriod],
    isLoadingEdgeMarketSnapshotsData,
    fundingRatePeriod,
  };
}
