import {
  ChainEnv,
  CollateralEventType,
  GetIndexerSubaccountCollateralEventsParams,
} from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useQuerySubaccountSummary } from 'client/hooks/query/subaccount/subaccountSummary/useQuerySubaccountSummary';

export function paginatedSubaccountCollateralEventsQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
  eventTypes?: CollateralEventType[],
  pageSize?: number,
) {
  return createQueryKey(
    'paginatedSubaccountCollateralEvents',
    chainEnv,
    subaccountOwner,
    subaccountName,
    eventTypes,
    pageSize,
  );
}

interface Params {
  eventTypes?: CollateralEventType[];
  pageSize: number;
}

/**
 * Fetches historical events for the current subaccount
 */
export function usePaginatedSubaccountCollateralEvents({
  eventTypes,
  pageSize,
}: Params) {
  const nadoClient = usePrimaryChainNadoClient();

  const { data: subaccountSummary } = useQuerySubaccountSummary();
  const hasSubaccount = !!subaccountSummary?.exists;

  const {
    currentSubaccount: {
      address: subaccountOwner,
      name: subaccountName,
      chainEnv,
    },
  } = useSubaccountContext();
  const disabled = !nadoClient || !subaccountOwner;

  return useInfiniteQuery({
    queryKey: paginatedSubaccountCollateralEventsQueryKey(
      chainEnv,
      subaccountOwner,
      subaccountName,
      eventTypes,
      pageSize,
    ),
    initialPageParam: <string | undefined>undefined,
    queryFn: async ({ pageParam }) => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      const params: GetIndexerSubaccountCollateralEventsParams = {
        limit: pageSize,
        startCursor: pageParam,
        subaccountOwner,
        subaccountName,
        // Only fetch non-isolated events to avoid duplication with isolated events
        // Cross account events include the isolated transfers as well
        isolated: false,
        eventTypes,
      };
      return nadoClient.context.indexerClient.getPaginatedSubaccountCollateralEvents(
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
    // Refetches are handled by WS event listeners when the subaccount exists, default to refetching every 5 seconds when the subaccount does not exist to catch initial deposit
    refetchInterval: hasSubaccount ? false : 5000,
  });
}
