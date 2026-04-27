import {
  GetIndexerSubaccountSettlementEventsResponse,
  IndexerSettlementEvent,
  removeDecimals,
} from '@nadohq/client';
import { nonNullFilter } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { useDataTablePaginatedQuery } from 'client/components/DataTable/hooks/useDataTablePaginatedQuery';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { AllMarketsStaticDataForChainEnv } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { usePaginatedSubaccountSettlementEvents } from 'client/hooks/query/subaccount/usePaginatedSubaccountSettlementEvents';
import { ProductTableItem } from 'client/modules/tables/types/ProductTableItem';
import { getProductTableItem } from 'client/modules/tables/utils/getProductTableItem';
import { createRowId } from 'client/utils/createRowId';
import { secondsToMilliseconds } from 'date-fns';
import { useMemo } from 'react';

export interface HistoricalSettlementsTableItem
  extends ProductTableItem, WithDataTableRowId {
  submissionIndex: string;
  positionAmount: BigNumber;
  isIsolated: boolean;
  timestampMillis: number;
  settlementQuoteAmount: BigNumber;

  /**
   * We use this to infer position side as position may be 0 at time
   * of settlement (i.e. position already closed)
   */
  preVQuoteBalance: BigNumber;
}

function extractItems(data: GetIndexerSubaccountSettlementEventsResponse) {
  return data.events;
}

interface Params {
  pageSize: number;
}

export function useSettlementEventsTable({ pageSize }: Params) {
  const { data: marketsStaticData, isLoading: marketsDataLoading } =
    useAllMarketsStaticData();

  const { isLoading, isFetchingCurrPage, currentPageData, pagination } =
    useDataTablePaginatedQuery({
      queryHook: usePaginatedSubaccountSettlementEvents,
      queryParams: {
        pageSize,
      },
      extractItems,
    });

  const mappedData: HistoricalSettlementsTableItem[] | undefined =
    useMemo(() => {
      if (!currentPageData || !marketsStaticData) {
        return;
      }
      return currentPageData
        .map((event): HistoricalSettlementsTableItem | undefined => {
          return getHistoricalSettlementsTableItem({
            event,
            allMarketsStaticData: marketsStaticData,
          });
        })
        .filter(nonNullFilter);
    }, [currentPageData, marketsStaticData]);

  return {
    isLoading: isLoading || marketsDataLoading || isFetchingCurrPage,
    mappedData,
    pagination,
  };
}

interface GetHistoricalSettlementsTableItemParams {
  event: IndexerSettlementEvent;
  allMarketsStaticData: AllMarketsStaticDataForChainEnv;
}

export function getHistoricalSettlementsTableItem({
  event,
  allMarketsStaticData,
}: GetHistoricalSettlementsTableItemParams): HistoricalSettlementsTableItem {
  const { timestamp, snapshot, quoteDelta } = event;
  const productId = snapshot.market.productId;

  return {
    ...getProductTableItem({
      productId,
      allMarketsStaticData,
    }),
    submissionIndex: event.submissionIndex,
    positionAmount: removeDecimals(event.snapshot.postBalance.amount),
    preVQuoteBalance: removeDecimals(event.snapshot.preBalance.vQuoteBalance),
    isIsolated: event.isolated,
    timestampMillis: secondsToMilliseconds(timestamp.toNumber()),
    settlementQuoteAmount: removeDecimals(quoteDelta),
    rowId: createRowId(
      event.submissionIndex,
      productId,
      event.isolated ? 'iso' : 'cross',
    ),
  };
}
