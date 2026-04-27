import { NadoClient, TriggerOrderInfo } from '@nadohq/client';
import { TriggerOrderInfoWithEngineOrder } from 'client/hooks/query/subaccount/types';

interface GetTriggerOrdersWithEngineOrdersParams {
  orders: TriggerOrderInfo[];
  nadoClient: NadoClient;
}

/**
 * Fetches the engine orders corresponding to the given trigger orders and attaches them to the trigger orders.
 * This is necessary because the trigger orders API does not return fill details, so we need to fetch the
 * triggered engine orders separately.
 */
export async function getTriggerOrdersWithEngineOrders({
  nadoClient,
  orders,
}: GetTriggerOrdersWithEngineOrdersParams): Promise<
  TriggerOrderInfoWithEngineOrder[]
> {
  const triggeredDigests = orders.map((order) => order.order.digest);

  const historicalEngineOrdersResponse =
    await nadoClient.market.getHistoricalOrders({
      digests: triggeredDigests,
    });

  // Attach matching engine order to each trigger order
  const engineOrdersByDigest = new Map(
    historicalEngineOrdersResponse.map((engineOrder) => [
      engineOrder.digest,
      engineOrder,
    ]),
  );

  return orders.map((order): TriggerOrderInfoWithEngineOrder => {
    return {
      ...order,
      triggeredEngineOrder: engineOrdersByDigest.get(order.order.digest),
    };
  });
}
