import { NadoClient } from '@nadohq/client';

export function getBookDepthSubscriptionParams(
  nadoClient: NadoClient,
  productId: number,
) {
  return nadoClient.ws.subscription.buildSubscriptionParams('book_depth', {
    product_id: productId,
  });
}

export function getMarketTradeSubscriptionParams(
  nadoClient: NadoClient,
  productId: number,
) {
  return nadoClient.ws.subscription.buildSubscriptionParams('trade', {
    product_id: productId,
  });
}
