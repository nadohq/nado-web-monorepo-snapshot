import {
  AppSubaccount,
  createQueryKey,
  QueryDisabledError,
  REACT_QUERY_CONFIG,
  useSubaccountContext,
} from '@nadohq/react-client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSpotInterestRates } from 'client/hooks/markets/useSpotInterestRates';
import { useQueryAllMarketsLatestPrices } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { useQueryLatestOraclePrices } from 'client/hooks/query/markets/useQueryLatestOraclePrices';
import { useQuerySubaccountIsolatedPositions } from 'client/hooks/query/subaccount/isolatedPositions/useQuerySubaccountIsolatedPositions';
import { useQuerySubaccountSummary } from 'client/hooks/query/subaccount/subaccountSummary/useQuerySubaccountSummary';
import { useSubaccountIndexerSnapshot } from 'client/hooks/subaccount/useSubaccountIndexerSnapshot';
import { getSubaccountOverview } from 'client/hooks/subaccount/useSubaccountOverview/getSubaccountOverview';
import { SubaccountOverview } from 'client/hooks/subaccount/useSubaccountOverview/types';
import { QueryState } from 'client/types/QueryState';

function subaccountOverviewQueryKey(
  subaccount: AppSubaccount,
  // Last update times for important queries
  dataUpdateTimes: number[],
  // Used for queries where we don't need an instantaneous refresh when data updates
  hasOraclePricesData: boolean,
  hasMarketPricesData: boolean,
  hasInterestRatesData: boolean,
) {
  return createQueryKey(
    'subaccountOverview',
    subaccount,
    dataUpdateTimes,
    hasOraclePricesData,
    hasMarketPricesData,
    hasInterestRatesData,
  );
}

/**
 * A util hook to create commonly used derived data for the current subaccount
 */
export function useSubaccountOverview(): QueryState<SubaccountOverview> {
  const { currentSubaccount } = useSubaccountContext();

  // Required queries
  const {
    data: subaccountSummary,
    dataUpdatedAt: subaccountSummaryUpdatedAt,
    isLoading: isLoadingSubaccountSummary,
    isError: isSubaccountSummaryError,
    isPending: isSubaccountSummaryPending,
  } = useQuerySubaccountSummary();
  const {
    data: isolatedPositions,
    dataUpdatedAt: isolatedPositionsUpdatedAt,
    isLoading: isLoadingIsolatedPositions,
    isError: isIsolatedPositionsError,
    isPending: isIsolatedPositionsPending,
  } = useQuerySubaccountIsolatedPositions();

  // Optional queries
  const { data: indexerSnapshot, dataUpdatedAt: indexerSnapshotUpdatedAt } =
    useSubaccountIndexerSnapshot();
  const { data: spotInterestRates } = useSpotInterestRates();
  const { data: latestOraclePrices } = useQueryLatestOraclePrices();
  const { data: latestMarketPrices } = useQueryAllMarketsLatestPrices();

  // Disable query updates if we're currently loading summary / iso position data, this helps to prevent cases where
  // query data (esp. for quote balances) becomes out of sync after a refetch
  const disabled =
    !subaccountSummary ||
    !isolatedPositions ||
    isSubaccountSummaryPending ||
    isIsolatedPositionsPending;

  const queryFn = (): SubaccountOverview => {
    if (disabled) {
      throw new QueryDisabledError();
    }

    return getSubaccountOverview({
      subaccountSummary,
      isolatedPositions,
      indexerSnapshot,
      spotInterestRates,
      latestOraclePrices,
      latestMarketPrices,
    });
  };

  const {
    data: mappedData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: subaccountOverviewQueryKey(
      currentSubaccount,
      [
        subaccountSummaryUpdatedAt,
        isolatedPositionsUpdatedAt,
        indexerSnapshotUpdatedAt,
      ],
      !!latestOraclePrices,
      !!latestMarketPrices,
      !!spotInterestRates,
    ),
    queryFn,
    // Prevents a "flash" in UI when query key changes, which occurs when subaccount overview data updates
    placeholderData: keepPreviousData,
    enabled: !disabled,
    gcTime: REACT_QUERY_CONFIG.computeQueryGcTime,
    staleTime: REACT_QUERY_CONFIG.computedQueryStaleTime,
    refetchInterval: REACT_QUERY_CONFIG.computedQueryRefetchInterval,
  });

  return {
    data: mappedData,
    isLoading:
      isLoading || isLoadingSubaccountSummary || isLoadingIsolatedPositions,
    isError: isError || isSubaccountSummaryError || isIsolatedPositionsError,
  };
}
