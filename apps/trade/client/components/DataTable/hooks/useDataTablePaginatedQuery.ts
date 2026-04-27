import { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { useDataTablePagination } from 'client/components/DataTable/hooks/useDataTablePagination';
import { DataTablePagination } from 'client/components/DataTable/types';
import { useMemo } from 'react';

interface WithPageSize {
  pageSize: number;
}

type QueryHookFn<TQueryParams, TQueryResponseData> =
  TQueryParams extends WithPageSize
    ? (
        params: TQueryParams,
      ) => UseInfiniteQueryResult<InfiniteData<TQueryResponseData>, Error>
    : never;

type UseDataTablePaginatedQueryParams<
  TQueryParams extends WithPageSize,
  TQueryResponseData,
  TQueryItemData,
> = {
  /** Paginated query hook for this table, e.g usePaginatedSubaccountCollateralEvents */
  queryHook: QueryHookFn<TQueryParams, TQueryResponseData>;

  /** The parameters for the query hook, which must include pageSize
   *   NB: we use dynamic typing here so TypeScript can constrain queryParams to be of
   *       the same type as the query hook
   */
  queryParams: Parameters<QueryHookFn<TQueryParams, TQueryResponseData>>[0];

  /**
   * Extracts items from the query response data into data table items.
   * For example, if the query response data is of type GetIndexerSubaccountCollateralEventsResponse,
   * the extractItems function should return an array of IndexerCollateralEvent.
   */
  extractItems: (data: TQueryResponseData) => TQueryItemData[];
};

interface UseDataTablePaginatedQueryResponse<TQueryItemData> {
  /*** The current page of data table items, empty if no data is available */
  currentPageData: TQueryItemData[];
  /*** Whether the data is currently being loaded */
  isLoading: boolean;
  /*** Whether data is currently being fetched */
  isFetching: boolean;
  /*** Whether the current page is being fetched */
  isFetchingCurrPage: boolean;
  /*** The pagination context */
  pagination: DataTablePagination;
}

/**
 * Hook to use a paginated query for a data table.
 * It handles pagination state, fetching next pages, and extracting items from the query response.
 */
export function useDataTablePaginatedQuery<
  TQueryParams extends WithPageSize,
  TQueryResponseData,
  TQueryItemData,
>({
  queryHook,
  queryParams,
  extractItems,
}: UseDataTablePaginatedQueryParams<
  TQueryParams,
  TQueryResponseData,
  TQueryItemData
>): UseDataTablePaginatedQueryResponse<TQueryItemData> {
  const {
    data,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
    hasNextPage,
  } = queryHook(queryParams);

  const { pageSize } = queryParams;
  const {
    pageCount,
    paginationState,
    setPaginationState,
    getPageData,
    isFetchingCurrPage,
  } = useDataTablePagination<TQueryResponseData, TQueryItemData>({
    numPagesFromQuery: data?.pages.length,
    pageSize,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
    extractItems,
  });

  const currentPageData = useMemo(() => getPageData(data), [getPageData, data]);

  return {
    isLoading,
    isFetching,
    isFetchingCurrPage,
    currentPageData,
    pagination: {
      pageCount,
      paginationState,
      setPaginationState,
      hasNextPage,
    },
  };
}
