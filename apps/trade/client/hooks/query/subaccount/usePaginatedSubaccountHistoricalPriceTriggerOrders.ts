import { ChainEnv, toBigNumber } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getTriggerOrdersWithEngineOrders } from 'client/hooks/query/subaccount/utils';
import { useGetRecvTime } from 'client/hooks/util/useGetRecvTime';
import {
  getNadoClientHasLinkedSigner,
  useNadoClientHasLinkedSigner,
} from 'client/hooks/util/useNadoClientHasLinkedSigner';
import { enableDebugTriggerQueriesAtom } from 'client/store/trading/commonTradingStore';
import { useAtom } from 'jotai';
import { get } from 'lodash';

export function paginatedSubaccountHistoricalPriceTriggerOrdersQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
  reduceOnly?: boolean | null,
  productIds?: number[] | null,
  // Without this in the query key, the query will be disabled but data will not be reset, resulting in "stale"
  // data from when 1CT was still enabled
  hasLinkedSigner?: boolean,
  pageSize?: number,
) {
  return createQueryKey(
    'paginatedSubaccountHistoricalPriceTriggerOrders',
    chainEnv,
    subaccountOwner,
    subaccountName,
    reduceOnly,
    productIds,
    hasLinkedSigner,
    pageSize,
  );
}

interface Params {
  pageSize: number;
  reduceOnly: boolean;
  productIds?: number[];
}

/**
 * Fetches historical price trigger orders for the current subaccount
 */
export function usePaginatedSubaccountHistoricalPriceTriggerOrders({
  pageSize,
  productIds,
  reduceOnly,
}: Params) {
  const [enableDebugTriggerQueries] = useAtom(enableDebugTriggerQueriesAtom);
  const nadoClient = usePrimaryChainNadoClient();
  const hasLinkedSigner = useNadoClientHasLinkedSigner();
  const getRecvTime = useGetRecvTime();
  const {
    currentSubaccount: {
      address: subaccountOwner,
      name: subaccountName,
      chainEnv,
    },
  } = useSubaccountContext();

  const meetsSigningRequirements = hasLinkedSigner || enableDebugTriggerQueries;
  const disabled = !nadoClient || !subaccountOwner || !meetsSigningRequirements;

  return useInfiniteQuery({
    queryKey: paginatedSubaccountHistoricalPriceTriggerOrdersQueryKey(
      chainEnv,
      subaccountOwner,
      subaccountName,
      reduceOnly,
      productIds ?? null,
      hasLinkedSigner,
      pageSize,
    ),
    initialPageParam: <number | undefined>undefined,
    queryFn: async ({ pageParam }) => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      if (
        !getNadoClientHasLinkedSigner(nadoClient) &&
        !enableDebugTriggerQueries
      ) {
        throw new QueryDisabledError();
      }

      // Query for 1 more than the requested page size to determine if there is a next page
      const queryLimit = pageSize + 1;
      const recvTime = toBigNumber(await getRecvTime());

      const baseResponse = await nadoClient.market.getTriggerOrders({
        subaccountOwner,
        subaccountName,
        triggerTypes: ['price_trigger'],
        // if statusTypes is updated, it should be reflected in getExportHistoryPriceTriggerOrdersData
        statusTypes: ['cancelled', 'triggering', 'triggered', 'internal_error'],
        productIds,
        reduceOnly,
        limit: queryLimit,
        maxUpdateTimeInclusive: pageParam,
        recvTime,
      });

      // This retrieves the (pageSize+1)th item in the response, which is used to determine if there is a next page
      const firstOrderOfNextPage = get(
        baseResponse.orders,
        pageSize,
        undefined,
      );

      const orders = baseResponse.orders.slice(0, pageSize);

      const triggerOrdersWithEngineOrders =
        await getTriggerOrdersWithEngineOrders({
          nadoClient,
          orders,
        });

      return {
        orders: triggerOrdersWithEngineOrders,
        meta: {
          hasMore: !!firstOrderOfNextPage,
          nextCursor: firstOrderOfNextPage?.updatedAt,
        },
      };
    },
    enabled: !disabled,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.nextCursor;
    },
  });
}
