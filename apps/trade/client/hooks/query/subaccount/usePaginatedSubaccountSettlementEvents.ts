import {
  ChainEnv,
  GetIndexerSubaccountSettlementEventsParams,
} from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useInfiniteQuery } from '@tanstack/react-query';

export function paginatedSubaccountSettlementEventsQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
  pageSize?: number,
) {
  return createQueryKey(
    'paginatedSubaccountSettlementEvents',
    chainEnv,
    subaccountOwner,
    subaccountName,
    pageSize,
  );
}

interface Params {
  pageSize: number;
}

/**
 * Fetches historical settlements for the current subaccount
 *
 */
export function usePaginatedSubaccountSettlementEvents({ pageSize }: Params) {
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
    queryKey: paginatedSubaccountSettlementEventsQueryKey(
      chainEnv,
      subaccountOwner,
      subaccountName,
      pageSize,
    ),
    initialPageParam: <string | undefined>undefined,
    queryFn: async ({ pageParam }) => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      const params: GetIndexerSubaccountSettlementEventsParams = {
        subaccountOwner,
        subaccountName,
        limit: pageSize,
        startCursor: pageParam,
      };
      return nadoClient.context.indexerClient.getPaginatedSubaccountSettlementEvents(
        params,
      );
    },
    enabled: !disabled,
    getNextPageParam: (lastPage) => {
      if (lastPage == null || !lastPage.meta.nextCursor) {
        // No more entries
        return null;
      }
      return lastPage.meta.nextCursor;
    },
  });
}
