import { ChainEnv, GetIndexerPaginatedOrdersResponse } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useInfiniteQuery } from '@tanstack/react-query';

export function paginatedSubaccountHistoricalEngineOrdersQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
  includeTriggerOrders?: boolean,
  productIds?: number[] | null,
  pageSize?: number,
) {
  return createQueryKey(
    'paginatedSubaccountHistoricalEngineOrders',
    chainEnv,
    subaccountOwner,
    subaccountName,
    includeTriggerOrders,
    productIds,
    pageSize,
  );
}

interface Params {
  pageSize: number;
  productIds?: number[];
  includeTriggerOrders?: boolean;
}

/**
 * Fetches historical engine orders for the current subaccount
 */
export function usePaginatedSubaccountHistoricalEngineOrders({
  pageSize,
  productIds,
  includeTriggerOrders,
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
    queryKey: paginatedSubaccountHistoricalEngineOrdersQueryKey(
      chainEnv,
      subaccountOwner,
      subaccountName,
      includeTriggerOrders,
      productIds ?? null,
      pageSize,
    ),
    initialPageParam: <string | undefined>undefined,
    getNextPageParam: (lastPage: GetIndexerPaginatedOrdersResponse) => {
      if (lastPage == null || !lastPage.meta.nextCursor) {
        // No more entries
        return null;
      }
      return lastPage.meta.nextCursor;
    },
    queryFn: async ({ pageParam }) => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      return nadoClient.context.indexerClient.getPaginatedSubaccountOrders({
        subaccountOwner,
        subaccountName,
        limit: pageSize,
        startCursor: pageParam,
        productIds,
        triggerTypes: includeTriggerOrders
          ? ['time_trigger', 'price_trigger', 'none']
          : ['none'],
      });
    },
    enabled: !disabled,
  });
}
