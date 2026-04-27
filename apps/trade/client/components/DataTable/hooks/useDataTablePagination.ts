import { InfiniteData } from '@tanstack/react-query';
import { PaginationState } from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';

interface Params<TResponseData, TItem> {
  pageSize: number;
  extractItems: (data: TResponseData) => TItem[];

  // From React Query
  numPagesFromQuery: number | undefined;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetching: boolean;
  fetchNextPage(): void;
}

export function useDataTablePagination<TResponseData, TItem>({
  numPagesFromQuery = 1,
  pageSize,
  fetchNextPage,
  hasNextPage,
  extractItems,
  isFetchingNextPage,
  isFetching,
}: Params<TResponseData, TItem>) {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  // Bound the page index to the last available page if the number of pages decreases and no next page is available.
  if (paginationState.pageIndex >= numPagesFromQuery && !hasNextPage) {
    const boundedPageIndex = Math.max(0, numPagesFromQuery - 1);

    setPaginationState((prev) => ({
      ...prev,
      pageIndex: boundedPageIndex,
    }));
  }

  useEffect(() => {
    if (
      // Don't interrupt react-query if it's already fetching.
      !isFetching &&
      // Check `numPagesFromQuery - 1` so we fetch the next page of the table
      // ahead of time rather than waiting until we need it.
      paginationState.pageIndex >= numPagesFromQuery - 1 &&
      hasNextPage
    ) {
      fetchNextPage();
    }
  }, [
    fetchNextPage,
    hasNextPage,
    numPagesFromQuery,
    paginationState.pageIndex,
    isFetching,
  ]);

  const getPageData = useCallback(
    (infiniteData?: InfiniteData<TResponseData>): TItem[] => {
      if (
        infiniteData?.pages == null ||
        !infiniteData.pages.length ||
        paginationState.pageIndex >= infiniteData.pages.length
      ) {
        return [];
      }

      return extractItems(infiniteData.pages[paginationState.pageIndex]);
    },
    [extractItems, paginationState.pageIndex],
  );

  // -1 if unknown, otherwise if there isn't a next page from the query, then the page count is the current # of pages
  const pageCount = hasNextPage ? -1 : numPagesFromQuery;

  // If we're fetching the "next" page but we've already reached the current number
  // of pages, we're actually doing a "just in time" fetch of the page we're on.
  const isFetchingCurrPage =
    isFetchingNextPage && paginationState.pageIndex >= numPagesFromQuery;

  return {
    paginationState,
    setPaginationState,
    pageCount,
    getPageData,
    isFetchingCurrPage,
  };
}
