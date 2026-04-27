import { subaccountToHex, unpackOrderAppendix } from '@nadohq/client';
import {
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQueryClient } from '@tanstack/react-query';
import { useInterval } from 'ahooks';
import { useUpdateOpenEngineOrdersQuery } from 'client/hooks/execute/util/useUpdateOpenEngineOrdersQuery';
import { useQuerySubaccountSummary } from 'client/hooks/query/subaccount/subaccountSummary/useQuerySubaccountSummary';
import { useSyncedRef } from 'client/hooks/util/useSyncedRef';
import { getUpdateQueryKeysFromFillEvent } from 'client/modules/app/queryRefetchListener/getUpdateQueryKeysFromFillEvent';
import { getUpdateQueryKeysFromPositionChangeEvent } from 'client/modules/app/queryRefetchListener/getUpdateQueryKeysFromPositionChangeEvent';
import { useEngineSubscriptionsWebSocket } from 'client/modules/webSockets/hooks/useEngineSubscriptionsWebSocket';
import { getEngineSubscriptionEventData } from 'client/modules/webSockets/utils/getEngineSubscriptionEventData';
import { useCallback, useEffect, useRef } from 'react';
import safeStringify from 'safe-stable-stringify';

// Backend indexes every roughly 100ms, so we flush every 100ms but delay individual
// query refetches by 200ms to ensure indexer has updated
const UPDATE_INTERVAL_MS = 100;
const REFETCH_DELAY_MS = 200;

/**
 * Subscribes to websocket events to determine when to take appropriate actions
 * in response to events for the current subaccount. For example, invalidating queries.
 *
 * Uses an interval to flush events. This is because multiple events can be sent in response to a single action, and we only want to refetch once.
 */
export function SubaccountWebSocketEventListener() {
  const queryClient = useQueryClient();
  const nadoClient = usePrimaryChainNadoClient();
  const { currentSubaccount } = useSubaccountContext();
  const currentSubaccountRef = useSyncedRef(currentSubaccount);
  const { data: subaccountSummary } = useQuerySubaccountSummary();
  const hasSubaccount = !!subaccountSummary?.exists;

  const updateOpenEngineOrders = useUpdateOpenEngineOrdersQuery();

  // Map of Query key JSON -> query key to refetch, with timestamps to ensure indexer has updated before refetching
  const queryKeyUpdatesRef = useRef(
    new Map<string, { queryKey: string[]; refetchAfterTimeMillis: number }>(),
  );
  // Open orders don't require the indexer, so we can refetch immediately
  const updateOpenEngineOrderProductIdsRef = useRef(new Set<number>());

  // Util fn to add general query keys (not open engine orders)
  const addQueryKeys = useCallback((queryKeys: Array<string[]>) => {
    const refetchAfterTimeMillis = Date.now() + REFETCH_DELAY_MS;
    queryKeys.forEach((queryKey) => {
      const queryKeyJson = safeStringify(queryKey);
      queryKeyUpdatesRef.current.set(queryKeyJson, {
        queryKey,
        refetchAfterTimeMillis,
      });
    });
  }, []);

  // Util fn to clear all pending updates
  const clearUpdates = useCallback(() => {
    queryKeyUpdatesRef.current.clear();
    updateOpenEngineOrderProductIdsRef.current.clear();
  }, []);

  const onMessage = useCallback(
    (message: MessageEvent) => {
      const appSubaccount = currentSubaccountRef.current;

      if (!appSubaccount.address) {
        return;
      }
      const subaccountWithAddress = {
        ...appSubaccount,
        // This is required for typecheck to work properly
        address: appSubaccount.address,
      };

      const event = getEngineSubscriptionEventData(message);
      if (!event) {
        return;
      }

      switch (event.type) {
        case 'position_change': {
          const queryKeys = getUpdateQueryKeysFromPositionChangeEvent({
            event,
            subaccount: subaccountWithAddress,
          });
          addQueryKeys(queryKeys);
          console.debug(
            '[SubaccountWebSocketEventListener] Handled position change event',
            event,
            queryKeys,
          );
          break;
        }
        case 'fill': {
          const queryKeys = getUpdateQueryKeysFromFillEvent({
            event,
            subaccount: subaccountWithAddress,
          });
          addQueryKeys(queryKeys);

          // Handle open engine orders
          const orderAppendix = unpackOrderAppendix(event.appendix);
          if (!orderAppendix.triggerType) {
            updateOpenEngineOrderProductIdsRef.current.add(event.product_id);
          }
          console.debug(
            '[SubaccountWebSocketEventListener] Handled fill event',
            event,
            queryKeys,
          );
          break;
        }
        default:
          break;
      }
    },
    [currentSubaccountRef, addQueryKeys],
  );

  const { sendJsonMessage, isActiveWebSocket } =
    useEngineSubscriptionsWebSocket({
      onMessage,
    });

  // Subscribe on changes to subaccount
  useEffect(() => {
    const { address, name: subaccountName } = currentSubaccount;
    if (
      !address ||
      !isActiveWebSocket ||
      !nadoClient ||
      // Backend does not emit subaccount events if subaccount does not exist, so we don't subscribe at all in this case
      !hasSubaccount
    ) {
      return;
    }

    const subaccountHex = subaccountToHex({
      subaccountName,
      subaccountOwner: address,
    });

    const positionChangeParams =
      nadoClient.ws.subscription.buildSubscriptionParams('position_change', {
        subaccount: subaccountHex,
      });
    const orderFillParams = nadoClient.ws.subscription.buildSubscriptionParams(
      'fill',
      {
        subaccount: subaccountHex,
      },
    );

    const allSubscriptionParams = [positionChangeParams, orderFillParams];
    console.debug(
      '[SubaccountWebSocketEventListener] Subscribing to websocket events',
      allSubscriptionParams,
    );
    allSubscriptionParams.forEach((params) => {
      sendJsonMessage(
        nadoClient.ws.subscription.buildSubscriptionMessage(
          0,
          'subscribe',
          params,
        ),
      );
    });

    return () => {
      clearUpdates();
      // Unsubscribe
      console.debug(
        '[SubaccountWebSocketEventListener] Unsubscribing from websocket events',
        allSubscriptionParams,
      );
      allSubscriptionParams.forEach((params) => {
        sendJsonMessage(
          nadoClient.ws.subscription.buildSubscriptionMessage(
            0,
            'unsubscribe',
            params,
          ),
        );
      });
    };
  }, [
    hasSubaccount,
    clearUpdates,
    currentSubaccount,
    isActiveWebSocket,
    nadoClient,
    sendJsonMessage,
  ]);

  // Flush updates on interval
  useInterval(() => {
    const now = Date.now();
    const queryKeysToRefetch: string[][] = [];
    const jsonKeysToRemove: string[] = [];

    // Check which query keys are ready to refetch
    queryKeyUpdatesRef.current.forEach((value, jsonKey) => {
      if (now >= value.refetchAfterTimeMillis) {
        queryKeysToRefetch.push(value.queryKey);
        jsonKeysToRemove.push(jsonKey);
      }
    });

    // Refetch ready queries and remove from map
    if (queryKeysToRefetch.length) {
      console.debug(
        '[SubaccountWebSocketEventListener] Updating queries with the following query keys',
        queryKeysToRefetch,
      );
      queryKeysToRefetch.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
      jsonKeysToRemove.forEach((jsonKey) => {
        queryKeyUpdatesRef.current.delete(jsonKey);
      });
    }

    // Refetch open engine orders immediately (no delay needed since they don't use indexer)
    const openEngineOrderProductIds = Array.from(
      updateOpenEngineOrderProductIdsRef.current,
    );
    if (openEngineOrderProductIds.length) {
      updateOpenEngineOrders(openEngineOrderProductIds);
      updateOpenEngineOrderProductIdsRef.current.clear();
    }
  }, UPDATE_INTERVAL_MS);

  return null;
}
