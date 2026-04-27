import { useEVMContext, usePrimaryChainNadoClient } from '@nadohq/react-client';
import { useQueryClient } from '@tanstack/react-query';
import { latestOrderFillsForProductQueryKey } from 'client/hooks/query/markets/useQueryLatestOrderFillsForProduct';
import { marketLiquidityQueryKey } from 'client/hooks/query/markets/useQueryMarketLiquidity';
import {
  getBookDepthSubscriptionParams,
  getMarketTradeSubscriptionParams,
} from 'client/modules/trading/webSockets/utils/subscriptionParams';
import { SendJsonMessage } from 'client/modules/webSockets/types';
import { useEffect } from 'react';

interface Params {
  productId?: number;
  isActiveWebSocket: boolean;
  sendJsonMessage: SendJsonMessage;
}

export function useHandleProductIdChange({
  isActiveWebSocket,
  productId,
  sendJsonMessage,
}: Params) {
  const { primaryChainEnv } = useEVMContext();
  const queryClient = useQueryClient();
  const nadoClient = usePrimaryChainNadoClient();

  useEffect(() => {
    if (!isActiveWebSocket || !nadoClient || !productId) {
      return;
    }

    // When switching between products, the old query data is stale, so invalidate the relevant queries
    queryClient.invalidateQueries({
      queryKey: marketLiquidityQueryKey(primaryChainEnv, productId),
    });
    queryClient.invalidateQueries({
      queryKey: latestOrderFillsForProductQueryKey(primaryChainEnv, productId),
    });

    const bookDepthParams = getBookDepthSubscriptionParams(
      nadoClient,
      productId,
    );
    const marketTradeParams = getMarketTradeSubscriptionParams(
      nadoClient,
      productId,
    );

    // Subscribe
    const subscribeMsgs = [
      nadoClient.ws.subscription.buildSubscriptionMessage(
        0,
        'subscribe',
        bookDepthParams,
      ),
      nadoClient.ws.subscription.buildSubscriptionMessage(
        0,
        'subscribe',
        marketTradeParams,
      ),
    ];
    subscribeMsgs.forEach((msg) => {
      sendJsonMessage(msg);
    });

    // Unsubscribe to cleanup
    return () => {
      if (!isActiveWebSocket) {
        return;
      }
      const unsubscribeMsgs = [
        nadoClient.ws.subscription.buildSubscriptionMessage(
          0,
          'unsubscribe',
          bookDepthParams,
        ),
        nadoClient.ws.subscription.buildSubscriptionMessage(
          0,
          'unsubscribe',
          marketTradeParams,
        ),
      ];
      unsubscribeMsgs.forEach((msg) => {
        sendJsonMessage(msg);
      });
    };
  }, [
    isActiveWebSocket,
    primaryChainEnv,
    productId,
    queryClient,
    sendJsonMessage,
    nadoClient,
  ]);
}
