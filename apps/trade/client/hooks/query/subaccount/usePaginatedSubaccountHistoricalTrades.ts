import { ChainEnv, GetIndexerSubaccountMatchEventParams } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useInfiniteQuery } from '@tanstack/react-query';

interface Params {
  pageSize: number;
  productIds?: number[];
}

export function paginatedSubaccountHistoricalTradesQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
  productIds?: number[] | null,
  pageSize?: number,
) {
  return createQueryKey(
    'paginatedSubaccountHistoricalTrades',
    chainEnv,
    subaccountOwner,
    subaccountName,
    productIds,
    pageSize,
  );
}

export function usePaginatedSubaccountHistoricalTrades({
  pageSize,
  productIds,
}: Params) {
  const nadoClient = usePrimaryChainNadoClient();
  const {
    currentSubaccount: {
      address: subaccountOwner,
      name: subaccountName,
      chainEnv,
    },
  } = useSubaccountContext();
  const disabled = !nadoClient || !subaccountOwner;

  return useInfiniteQuery({
    queryKey: paginatedSubaccountHistoricalTradesQueryKey(
      chainEnv,
      subaccountOwner,
      subaccountName,
      productIds ?? null,
      pageSize,
    ),
    initialPageParam: <string | undefined>undefined,
    queryFn: async ({ pageParam }) => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const params: GetIndexerSubaccountMatchEventParams = {
        subaccountOwner,
        subaccountName,
        limit: pageSize,
        startCursor: pageParam,
        productIds,
      };

      return nadoClient.context.indexerClient.getPaginatedSubaccountMatchEvents(
        params,
      );
    },
    getNextPageParam: (lastPage) => {
      if (lastPage == null || !lastPage.meta.nextCursor) {
        // No more entries
        return null;
      }
      return lastPage.meta.nextCursor;
    },
    enabled: !disabled,
    // This query is refreshed via `SubaccountWebSocketEventListener` so we shouldn't need "dumb" refresh intervals
  });
}
