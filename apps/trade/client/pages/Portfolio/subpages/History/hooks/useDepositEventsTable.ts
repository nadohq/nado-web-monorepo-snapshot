import {
  GetIndexerSubaccountCollateralEventsResponse,
  IndexerCollateralEvent,
} from '@nadohq/client';
import { useDataTablePaginatedQuery } from 'client/components/DataTable/hooks/useDataTablePaginatedQuery';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { usePaginatedSubaccountCollateralEvents } from 'client/hooks/query/subaccount/usePaginatedSubaccountCollateralEvents';
import { getDepositCollateralEvent } from 'client/modules/events/collateral/getDepositCollateralEvent';
import { DepositCollateralEvent } from 'client/modules/events/collateral/types';
import { useMemo } from 'react';

function extractItems(
  data: GetIndexerSubaccountCollateralEventsResponse,
): IndexerCollateralEvent[] {
  return data.events;
}

interface Params {
  pageSize: number;
}

export function useDepositEventsTable({ pageSize }: Params) {
  const { data: allMarketsStaticData, isLoading: allMarketsLoading } =
    useAllMarketsStaticData();

  const {
    isLoading: isLoadingPaginatedSubaccountEvents,
    isFetchingCurrPage,
    currentPageData,
    pagination,
  } = useDataTablePaginatedQuery({
    queryHook: usePaginatedSubaccountCollateralEvents,
    queryParams: {
      pageSize,
      eventTypes: ['deposit_collateral'],
    },
    extractItems,
  });

  const mappedData: DepositCollateralEvent[] | undefined = useMemo(() => {
    if (!currentPageData || !allMarketsStaticData) {
      return undefined;
    }

    return currentPageData.map((event) => {
      return getDepositCollateralEvent({
        event,
        allMarketsStaticData,
      });
    });
  }, [currentPageData, allMarketsStaticData]);

  return {
    isLoading:
      isLoadingPaginatedSubaccountEvents ||
      allMarketsLoading ||
      isFetchingCurrPage,
    mappedData,
    pagination,
  };
}
