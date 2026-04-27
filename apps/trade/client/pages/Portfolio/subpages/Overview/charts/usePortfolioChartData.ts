import { removeDecimals } from '@nadohq/client';
import {
  AppSubaccount,
  createQueryKey,
  getSubaccountMetricsFromIndexerSnapshot,
  QueryDisabledError,
  REACT_QUERY_CONFIG,
  useSubaccountContext,
} from '@nadohq/react-client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useQuerySubaccountIndexerSnapshots } from 'client/hooks/query/subaccount/useQuerySubaccountIndexerSnapshots';
import { useSubaccountCreationTime } from 'client/hooks/subaccount/useSubaccountCreationTime';
import { useChartQuerySecondsBeforeNow } from 'client/modules/charts/hooks/useChartQuerySecondsBeforeNow';
import { ChartTimespan } from 'client/modules/charts/types';
import { PortfolioChartDataItem } from 'client/pages/Portfolio/charts/types';
import { QueryState } from 'client/types/QueryState';
import { secondsToMilliseconds } from 'date-fns';

function portfolioChartDataQueryKey(
  subaccount: AppSubaccount,
  timespan?: ChartTimespan,
  dataUpdatedAt?: number,
) {
  return createQueryKey(
    'portfolioChartData',
    subaccount,
    timespan,
    dataUpdatedAt,
  );
}

export function usePortfolioChartData(
  timespan: ChartTimespan,
): QueryState<PortfolioChartDataItem[]> {
  const { currentSubaccount } = useSubaccountContext();
  const subaccountCreationTime = useSubaccountCreationTime();
  const { secondsBeforeNow } = useChartQuerySecondsBeforeNow({
    timespan,
    earliestTimeInSeconds: subaccountCreationTime,
  });
  const {
    data: indexerSummaries,
    isLoading: isLoadingIndexerSummaries,
    isError: isIndexerSummariesError,
    dataUpdatedAt,
  } = useQuerySubaccountIndexerSnapshots({
    secondsBeforeNow,
  });

  const disabled = !indexerSummaries;

  const queryFn = async (): Promise<PortfolioChartDataItem[]> => {
    if (disabled) {
      throw new QueryDisabledError();
    }

    return indexerSummaries.map((summary): PortfolioChartDataItem => {
      const metrics = getSubaccountMetricsFromIndexerSnapshot(summary);

      // Overview
      const portfolioValueUsd = removeDecimals(
        metrics.portfolioValue,
      ).toNumber();

      const cumulativeAccountPnlUsd = removeDecimals(
        metrics.cumulativeAccountPnl,
      ).toNumber();

      // Perpetuals
      const cumulativeTotalPerpPnlUsd = removeDecimals(
        metrics.cumulativeTotalPerpPnl,
      ).toNumber();

      const cumulativeTotalVolumeUsd = removeDecimals(
        metrics.cumulativeTotalVolume,
      ).toNumber();

      return {
        timestampMillis: secondsToMilliseconds(summary.timestamp.toNumber()),
        portfolioValueUsd,
        cumulativeAccountPnlUsd,
        cumulativeTotalPerpPnlUsd,
        cumulativeTotalVolumeUsd,
      };
    });
  };

  const {
    data: portfolioChartData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: portfolioChartDataQueryKey(
      currentSubaccount,
      timespan,
      dataUpdatedAt,
    ),
    queryFn,
    enabled: !disabled,
    placeholderData: keepPreviousData,
    gcTime: REACT_QUERY_CONFIG.computeQueryGcTime,
    staleTime: REACT_QUERY_CONFIG.computedQueryStaleTime,
  });

  return {
    data: portfolioChartData,
    isLoading: isLoading || isLoadingIndexerSummaries,
    isError: isError || isIndexerSummariesError,
  };
}
