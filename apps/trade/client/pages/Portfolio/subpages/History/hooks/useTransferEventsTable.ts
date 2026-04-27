import {
  GetIndexerSubaccountCollateralEventsResponse,
  IndexerCollateralEvent,
} from '@nadohq/client';
import { useSubaccountContext } from '@nadohq/react-client';
import { useDataTablePaginatedQuery } from 'client/components/DataTable/hooks/useDataTablePaginatedQuery';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { usePaginatedSubaccountCollateralEvents } from 'client/hooks/query/subaccount/usePaginatedSubaccountCollateralEvents';
import { getTransferCollateralEvent } from 'client/modules/events/collateral/getTransferCollateralEvent';
import { TransferCollateralEvent } from 'client/modules/events/collateral/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

function extractItems(
  data: GetIndexerSubaccountCollateralEventsResponse,
): IndexerCollateralEvent[] {
  return data.events;
}

interface Params {
  pageSize: number;
}

export function useTransferEventsTable({ pageSize }: Params) {
  const { t } = useTranslation();
  const { data: allMarketsStaticData, isLoading: allMarketsLoading } =
    useAllMarketsStaticData();
  const { getSubaccountProfile } = useSubaccountContext();

  const {
    isLoading: isLoadingPaginatedSubaccountEvents,
    isFetchingCurrPage,
    currentPageData,
    pagination,
  } = useDataTablePaginatedQuery({
    queryHook: usePaginatedSubaccountCollateralEvents,
    queryParams: {
      pageSize,
      eventTypes: ['transfer_quote'],
    },
    extractItems,
  });

  const mappedData: TransferCollateralEvent[] | undefined = useMemo(() => {
    if (!currentPageData || !allMarketsStaticData) {
      return undefined;
    }

    return currentPageData.map((event) => {
      return getTransferCollateralEvent({
        event,
        allMarketsStaticData,
        getSubaccountProfile,
        t,
      });
    });
  }, [currentPageData, allMarketsStaticData, getSubaccountProfile, t]);

  return {
    isLoading:
      isLoadingPaginatedSubaccountEvents ||
      allMarketsLoading ||
      isFetchingCurrPage,
    mappedData,
    pagination,
  };
}
