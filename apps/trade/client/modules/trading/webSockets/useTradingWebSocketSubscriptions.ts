import { QueryObserverOptions, useQueryClient } from '@tanstack/react-query';
import { latestOrderFillsForProductQueryKey } from 'client/hooks/query/markets/useQueryLatestOrderFillsForProduct';
import { marketLiquidityQueryKey } from 'client/hooks/query/markets/useQueryMarketLiquidity';
import { useHandleProductIdChange } from 'client/modules/trading/webSockets/hooks/useHandleProductIdChange';
import { useOnMessageHandler } from 'client/modules/trading/webSockets/hooks/useOnMessageHandler';
import { useEngineSubscriptionsWebSocket } from 'client/modules/webSockets/hooks/useEngineSubscriptionsWebSocket';
import { useEffect } from 'react';

export function useTradingWebSocketSubscriptions(productId?: number) {
  const queryClient = useQueryClient();

  const onMessage = useOnMessageHandler({ productId });
  const { isActiveWebSocket, sendJsonMessage } =
    useEngineSubscriptionsWebSocket({ onMessage });

  // Default queries to fast refetch when not connected
  useEffect(() => {
    const queryOptions: Partial<QueryObserverOptions> = isActiveWebSocket
      ? {
          staleTime: Infinity,
          refetchInterval: false,
        }
      : {
          // Reset stale time to inherit query client defaults
          staleTime: undefined,
          refetchInterval: 5000,
        };

    queryClient.setQueryDefaults(marketLiquidityQueryKey(), queryOptions);
    queryClient.setQueryDefaults(
      latestOrderFillsForProductQueryKey(),
      queryOptions,
    );
  }, [isActiveWebSocket, queryClient]);

  // Handle product ID change effects
  useHandleProductIdChange({
    productId,
    isActiveWebSocket,
    sendJsonMessage,
  });
}
