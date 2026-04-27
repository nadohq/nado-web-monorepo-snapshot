import {
  ChainEnv,
  GetIndexerSubaccountLiquidationEventsParams,
  IndexerLiquidationEvent,
} from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { isLiquidationFinalizationTx } from 'client/utils/isLiquidationFinalizationTx';
import { get } from 'lodash';

interface Params {
  productIds?: number[];
  pageSize: number;
}

export function paginatedSubaccountLiquidationEventsQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
  productIds?: number[],
  pageSize?: number,
) {
  return createQueryKey(
    'paginatedSubaccountLiquidationEvents',
    chainEnv,
    subaccountOwner,
    subaccountName,
    productIds ?? null,
    pageSize,
  );
}

/**
 * Fetches current subaccount liquidation events.
 */
export function usePaginatedSubaccountLiquidationEvents({
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
    queryKey: paginatedSubaccountLiquidationEventsQueryKey(
      chainEnv,
      subaccountOwner,
      subaccountName,
      productIds,
      pageSize,
    ),
    initialPageParam: <string | undefined>undefined,
    queryFn: async ({ pageParam }) => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      // Fetch 1 more than the requested page size to determine pagination metadata, as nextCursor is inclusive
      const limit = pageSize + 1;
      const events: IndexerLiquidationEvent[] = [];

      let startCursor: string | undefined = pageParam;

      // Keep polling until we get enough, otherwise we might end up with an empty page when user has a lot of finalization transactions.
      while (events.length < limit) {
        const params: GetIndexerSubaccountLiquidationEventsParams = {
          subaccountOwner,
          subaccountName,
          limit,
          startCursor,
          productIds,
        };

        const liquidationEventsResponse =
          await nadoClient.context.indexerClient.getPaginatedSubaccountLiquidationEvents(
            params,
          );

        liquidationEventsResponse.events.forEach((event) => {
          if (isLiquidationFinalizationTx(event.quote.indexerEvent.tx)) {
            return;
          }

          events.push(event);
        });

        // Update the next cursor
        startCursor = liquidationEventsResponse.meta.nextCursor;

        // Break if there are no more events for pagination
        if (!liquidationEventsResponse.meta.hasMore || !startCursor) {
          break;
        }
      }

      const hasMore = events.length > pageSize;

      return {
        meta: {
          hasMore,
          // Cursor is inclusive, the last item in page should be the start of the next page if hasMore is true
          nextCursor: hasMore
            ? get(events, pageSize)?.submissionIndex
            : undefined,
        },
        events: events.slice(0, pageSize),
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage == null || !lastPage.meta.nextCursor) {
        // No more entries
        return null;
      }
      return lastPage.meta.nextCursor;
    },
    enabled: !disabled,
    // Refetches are handled by WS event listeners
  });
}
