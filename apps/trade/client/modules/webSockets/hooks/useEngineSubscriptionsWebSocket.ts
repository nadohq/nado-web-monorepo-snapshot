import { ENGINE_WS_SUBSCRIPTION_CLIENT_ENDPOINTS } from '@nadohq/client';
import { useEVMContext, usePrimaryChainNadoClient } from '@nadohq/react-client';
import { SendJsonMessage } from 'client/modules/webSockets/types';
import { useMemo } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

interface Params {
  onMessage: (message: MessageEvent) => void;
}

interface UseNadoSubscriptionsWebSocket {
  isActiveWebSocket: boolean;
  sendJsonMessage: SendJsonMessage;
}

/**
 * Standardized hook for a webSocket connection to the Nado Subscriptions endpoint.
 *
 * IMPORTANT: This hook SHARES a single webSocket connection across all instances of this hook.
 * This means that multiple components using this hook will all receive the same messages.
 * Each component will need to filter messages themselves if they only care about a subset.
 */
export function useEngineSubscriptionsWebSocket({
  onMessage,
}: Params): UseNadoSubscriptionsWebSocket {
  const { primaryChainEnv } = useEVMContext();
  const nadoClient = usePrimaryChainNadoClient();

  const wsEndpoint = useMemo(() => {
    return ENGINE_WS_SUBSCRIPTION_CLIENT_ENDPOINTS[primaryChainEnv];
  }, [primaryChainEnv]);

  const isReady = !!nadoClient;

  const { readyState, sendJsonMessage } = useWebSocket(
    wsEndpoint,
    {
      onMessage,
      share: true,
      shouldReconnect: () => {
        return true;
      },
      onOpen: () => {
        console.debug(
          '[useEngineSubscriptionsWebSocket] WebSocket connection opened',
        );
      },
      onClose: () => {
        console.debug(
          '[useEngineSubscriptionsWebSocket] WebSocket connection closed',
        );
      },
      // No limit on attempts
      reconnectAttempts: Infinity,
      reconnectInterval: (attemptNumber) => {
        console.debug(
          '[useEngineSubscriptionsWebSocket] WebSocket connection reconnecting',
        );
        /**
         * attemptNumber will be 0 the first time it attempts to reconnect,
         * so this equation results in a reconnect pattern of 1 second, 2 seconds, 4 seconds, 8 seconds,
         * and then caps at 10 seconds until the maximum number of attempts is reached
         */
        if (attemptNumber > 3) {
          return 10000;
        }
        return Math.pow(2, attemptNumber) * 1000;
      },
      /**
       * This filters out all updates for tracked state variables from useWebSocket (ex. lastMessage)
       * This does not affect the onMessage handler. Without this, state changes will force surrounding
       * components to rerender, which leads to unnecessary rerenders.
       */
      filter: () => false,
    },
    isReady,
  );

  const isActiveWebSocket = readyState === ReadyState.OPEN;

  return {
    isActiveWebSocket,
    sendJsonMessage,
  };
}
