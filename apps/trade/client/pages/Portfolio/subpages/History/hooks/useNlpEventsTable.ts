import {
  GetIndexerSubaccountNlpEventsResponse,
  IndexerNlpEvent,
  removeDecimals,
} from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { useDataTablePaginatedQuery } from 'client/components/DataTable/hooks/useDataTablePaginatedQuery';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { usePaginatedSubaccountNlpEvents } from 'client/hooks/query/subaccount/usePaginatedSubaccountNlpEvents';
import { createRowId } from 'client/utils/createRowId';
import { secondsToMilliseconds } from 'date-fns';
import { useMemo } from 'react';

export interface HistoricalNlpEventsTableItem extends WithDataTableRowId {
  timestampMillis: number;
  action: 'deposit' | 'withdraw';
  amountChanges: {
    nlpAmount: BigNumber;
    primaryQuoteAmount: BigNumber;
  };
  submissionIndex: string;
}

function extractItems(data: GetIndexerSubaccountNlpEventsResponse) {
  return data.events;
}

interface Params {
  pageSize: number;
}

export function useNlpEventsTable({ pageSize }: Params) {
  const { isLoading, isFetchingCurrPage, currentPageData, pagination } =
    useDataTablePaginatedQuery({
      queryHook: usePaginatedSubaccountNlpEvents,
      queryParams: {
        pageSize,
      },
      extractItems,
    });

  const mappedData = useMemo((): HistoricalNlpEventsTableItem[] | undefined => {
    if (!currentPageData) {
      return undefined;
    }
    return currentPageData.map((event) => {
      return getHistoricalNlpEventsTableItem({
        event,
      });
    });
  }, [currentPageData]);

  return {
    isLoading: isLoading || isFetchingCurrPage,
    mappedData,
    pagination,
  };
}

interface GetHistoricalNlpEventsTableItemParams {
  event: IndexerNlpEvent;
}

function getHistoricalNlpEventsTableItem({
  event,
}: GetHistoricalNlpEventsTableItemParams): HistoricalNlpEventsTableItem {
  const { nlpDelta, primaryQuoteDelta, timestamp } = event;
  const action = nlpDelta.isPositive() ? 'deposit' : 'withdraw';

  return {
    timestampMillis: secondsToMilliseconds(timestamp.toNumber()),
    action,
    submissionIndex: event.submissionIndex,
    amountChanges: {
      nlpAmount: removeDecimals(nlpDelta),
      primaryQuoteAmount: removeDecimals(primaryQuoteDelta),
    },
    rowId: createRowId(event.submissionIndex, action),
  };
}
