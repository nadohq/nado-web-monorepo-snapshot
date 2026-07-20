import { EngineServerAllBboEntry, removeDecimals } from '@nadohq/client';
import { useEVMContext, usePrimaryChainNadoClient } from '@nadohq/react-client';
import { useQueryClient } from '@tanstack/react-query';
import { useInterval } from 'ahooks';
import {
  AllLatestMarketPricesData,
  allLatestMarketPricesQueryKey,
  getLatestMarketPrice,
} from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { useEngineSubscriptionsWebSocket } from 'client/modules/webSockets/hooks/useEngineSubscriptionsWebSocket';
import { getEngineSubscriptionEventData } from 'client/modules/webSockets/utils/getEngineSubscriptionEventData';
import { useCallback, useEffect, useRef } from 'react';

// The `all_bbo` stream pushes a full-market snapshot. We
// coalesce snapshots and flush to the query cache on this interval to bound the
// number of re-renders across price-consuming components.
const FLUSH_INTERVAL_MS = 1000;

/**
 * Keeps the all-markets latest-prices query cache fresh from the `all_bbo`
 * websocket stream, removing the need to poll every market's price on an
 * interval.
 */
export function MarketPricesWebSocketListener() {
  const { primaryChainEnv } = useEVMContext();
  const nadoClient = usePrimaryChainNadoClient();
  const queryClient = useQueryClient();

  const batchedBbosRef = useRef<Record<number, EngineServerAllBboEntry>>({});

  const onMessage = useCallback((message: MessageEvent) => {
    const event = getEngineSubscriptionEventData(message);

    if (event?.type !== 'all_bbo') {
      return;
    }

    Object.entries(event.bbos).forEach(([productId, entry]) => {
      batchedBbosRef.current[Number(productId)] = entry;
    });
  }, []);

  const { isActiveWebSocket, sendJsonMessage } =
    useEngineSubscriptionsWebSocket({ onMessage });

  useEffect(() => {
    if (!isActiveWebSocket || !nadoClient) {
      return;
    }

    const params = nadoClient.ws.subscription.buildSubscriptionParams(
      'all_bbo',
      {},
    );

    console.debug(
      '[MarketPricesWebSocketListener] Subscribing to all_bbo stream',
    );

    sendJsonMessage(
      nadoClient.ws.subscription.buildSubscriptionMessage(
        0,
        'subscribe',
        params,
      ),
    );

    return () => {
      console.debug(
        '[MarketPricesWebSocketListener] Unsubscribing from all_bbo stream',
      );

      sendJsonMessage(
        nadoClient.ws.subscription.buildSubscriptionMessage(
          0,
          'unsubscribe',
          params,
        ),
      );
    };
  }, [isActiveWebSocket, nadoClient, sendJsonMessage]);

  useInterval(() => {
    const batchedEntries = Object.entries(batchedBbosRef.current);

    if (!batchedEntries.length) {
      return;
    }

    batchedBbosRef.current = {};

    queryClient.setQueriesData<AllLatestMarketPricesData>(
      { queryKey: allLatestMarketPricesQueryKey(primaryChainEnv) },
      (prev) => {
        // Merge, rather than replace: a snapshot only includes products with a
        // cached BBO, so products absent from it keep their last known price.
        const next: AllLatestMarketPricesData = { ...prev };

        batchedEntries.forEach(([productId, entry]) => {
          next[Number(productId)] = getLatestMarketPrice({
            bid: removeDecimals(entry.bid),
            ask: removeDecimals(entry.ask),
          });
        });

        return next;
      },
    );
  }, FLUSH_INTERVAL_MS);

  return null;
}
