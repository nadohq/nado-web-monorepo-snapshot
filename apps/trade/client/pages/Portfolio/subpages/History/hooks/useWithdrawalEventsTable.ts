import {
  GetIndexerSubaccountCollateralEventsResponse,
  IndexerCollateralEvent,
} from '@nadohq/client';
import { useDataTablePaginatedQuery } from 'client/components/DataTable/hooks/useDataTablePaginatedQuery';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { usePaginatedSubaccountCollateralEvents } from 'client/hooks/query/subaccount/usePaginatedSubaccountCollateralEvents';
import { useQueryAllProductsWithdrawPoolLiquidity } from 'client/hooks/query/withdrawPool/useQueryAllProductsWithdrawPoolLiquidity';
import { useAreWithdrawalsProcessing } from 'client/modules/collateral/hooks/useAreWithdrawalsProcessing';
import { getWithdrawCollateralEvent } from 'client/modules/events/collateral/getWithdrawCollateralEvent';
import { WithdrawCollateralEvent } from 'client/modules/events/collateral/types';
import { useMemo } from 'react';

function extractItems(
  data: GetIndexerSubaccountCollateralEventsResponse,
): IndexerCollateralEvent[] {
  return data.events;
}

interface Params {
  pageSize: number;
}

export function useWithdrawalEventsTable({ pageSize }: Params) {
  const { data: allMarketsStaticData, isLoading: allMarketsLoading } =
    useAllMarketsStaticData();
  const { data: allProductsWithdrawPoolLiquidityData } =
    useQueryAllProductsWithdrawPoolLiquidity();

  const {
    isLoading: isLoadingPaginatedSubaccountEvents,
    isFetchingCurrPage,
    currentPageData,
    pagination,
  } = useDataTablePaginatedQuery({
    queryHook: usePaginatedSubaccountCollateralEvents,
    queryParams: {
      pageSize,
      eventTypes: ['withdraw_collateral'],
    },
    extractItems,
  });

  const withdrawalSubmissionIndices = useMemo(
    () => currentPageData?.map((event) => event.submissionIndex),
    [currentPageData],
  );

  const areWithdrawalsProcessingData = useAreWithdrawalsProcessing({
    submissionIndices: withdrawalSubmissionIndices,
  });

  const mappedData: WithdrawCollateralEvent[] | undefined = useMemo(() => {
    if (!currentPageData || !allMarketsStaticData) {
      return undefined;
    }

    return currentPageData.map((event) => {
      return getWithdrawCollateralEvent({
        event,
        allMarketsStaticData,
        areWithdrawalsProcessingData,
        allProductsWithdrawPoolLiquidityData,
      });
    });
  }, [
    currentPageData,
    allMarketsStaticData,
    areWithdrawalsProcessingData,
    allProductsWithdrawPoolLiquidityData,
  ]);

  return {
    isLoading:
      isLoadingPaginatedSubaccountEvents ||
      allMarketsLoading ||
      isFetchingCurrPage,
    mappedData,
    pagination,
  };
}
