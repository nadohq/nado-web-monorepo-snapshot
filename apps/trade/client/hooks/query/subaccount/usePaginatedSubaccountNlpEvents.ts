import { ChainEnv, GetIndexerSubaccountNlpEventsParams } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useInfiniteQuery } from '@tanstack/react-query';

export function paginatedSubaccountNlpEventsQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
  pageSize?: number,
) {
  return createQueryKey(
    'paginatedSubaccountNlpEvents',
    chainEnv,
    subaccountOwner,
    subaccountName,
    pageSize,
  );
}

interface Params {
  pageSize: number;
}

export function usePaginatedSubaccountNlpEvents({ pageSize }: Params) {
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
    queryKey: paginatedSubaccountNlpEventsQueryKey(
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
      const params: GetIndexerSubaccountNlpEventsParams = {
        subaccountOwner,
        subaccountName,
        limit: pageSize,
        startCursor: pageParam,
      };
      return nadoClient.context.indexerClient.getPaginatedSubaccountNlpEvents(
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
  });
}
