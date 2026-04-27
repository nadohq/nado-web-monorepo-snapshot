import { ChainEnv, toBigNumber } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { TriggerOrderInfoWithEngineOrder } from 'client/hooks/query/subaccount/types';
import { useGetRecvTime } from 'client/hooks/util/useGetRecvTime';
import {
  getNadoClientHasLinkedSigner,
  useNadoClientHasLinkedSigner,
} from 'client/hooks/util/useNadoClientHasLinkedSigner';
import { enableDebugTriggerQueriesAtom } from 'client/store/trading/commonTradingStore';
import { useAtom } from 'jotai';

/**
 * Product ID -> TriggerOrder[]
 */
export type SubaccountOpenTriggerOrdersData = Record<
  number,
  TriggerOrderInfoWithEngineOrder[]
>;

export function subaccountOpenTriggerOrdersQueryKey(
  chainEnv?: ChainEnv,
  sender?: string,
  subaccountName?: string,
  /** Without this in the query key, the query will be disabled but data will not be reset, resulting in "stale" data from when 1CT was still enabled */
  hasLinkedSigner?: boolean,
) {
  return createQueryKey(
    'currentSubaccountOpenTriggerOrders',
    chainEnv,
    sender,
    subaccountName,
    hasLinkedSigner,
  );
}

/**
 * All open trigger orders for the current subaccount
 */
export function useQuerySubaccountOpenTriggerOrders() {
  const [enableDebugTriggerQueries] = useAtom(enableDebugTriggerQueriesAtom);
  const nadoClient = usePrimaryChainNadoClient();
  const hasLinkedSigner = useNadoClientHasLinkedSigner();
  const getRecvTime = useGetRecvTime();
  const {
    currentSubaccount: { name, address, chainEnv, chainId },
  } = useSubaccountContext();

  const meetsSigningRequirements = hasLinkedSigner || enableDebugTriggerQueries;
  const disabled = !nadoClient || !address || !meetsSigningRequirements;

  return useQuery({
    queryKey: subaccountOpenTriggerOrdersQueryKey(
      chainEnv,
      address,
      name,
      hasLinkedSigner,
    ),
    queryFn: async (): Promise<SubaccountOpenTriggerOrdersData> => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      if (
        !getNadoClientHasLinkedSigner(nadoClient) &&
        !enableDebugTriggerQueries
      ) {
        throw new QueryDisabledError();
      }

      const recvTime = toBigNumber(await getRecvTime());

      const triggerOrdersResponse = await nadoClient.market.getTriggerOrders({
        subaccountOwner: address,
        subaccountName: name,
        chainId,
        // Include 'triggering' so that TWAP orders remain visible while a
        // slice is being executed (the backend briefly moves from
        // twap_executing -> triggering -> twap_executing per slice).
        statusTypes: [
          'waiting_price',
          'waiting_dependency',
          'twap_executing',
          'triggering',
        ],
        recvTime,
      });

      // `getTriggerOrders` does not return fill details. For TWAP, the trigger order digest
      // matches the digest of the emitted engine order (backend reuses the same engine order).
      // We therefore fetch historical engine orders by those digests and merge them in.
      const triggerOrderDigests = triggerOrdersResponse.orders.map(
        (order) => order.order.digest,
      );

      const historicalEngineOrdersResponse =
        await nadoClient.market.getHistoricalOrders({
          digests: triggerOrderDigests,
        });

      // Map of engine orders by digest for quick lookup
      const engineOrdersByDigest = new Map(
        historicalEngineOrdersResponse.map((engineOrder) => [
          engineOrder.digest,
          engineOrder,
        ]),
      );

      // Attach matching engine order to each trigger order
      const triggerOrdersWithEngineOrders = triggerOrdersResponse.orders.map(
        (order): TriggerOrderInfoWithEngineOrder => {
          return {
            ...order,
            triggeredEngineOrder: engineOrdersByDigest.get(order.order.digest),
          };
        },
      );

      // Group by productId for final shape
      const ordersByProductId: Record<
        number,
        TriggerOrderInfoWithEngineOrder[]
      > = {};

      triggerOrdersWithEngineOrders.forEach((info) => {
        const productId = info.order.productId;

        const orders = ordersByProductId[productId] ?? [];
        orders.push(info);

        ordersByProductId[productId] = orders;
      });

      return ordersByProductId;
    },
    enabled: !disabled,
    // Our refetch-after-execute logic should take care of most data updates, but we should
    // still refetch as trigger orders can be cancelled externally (ex. if a limit order tied to a trigger order is cancelled)
    refetchInterval: 10000,
  });
}
