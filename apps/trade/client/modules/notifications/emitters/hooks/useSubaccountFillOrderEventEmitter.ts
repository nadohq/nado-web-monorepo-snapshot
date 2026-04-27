import { toBigNumber, unpackOrderAppendix } from '@nadohq/client';
import { calcOrderFillPrice, useSubaccountContext } from '@nadohq/react-client';
import { usePaginatedSubaccountHistoricalTrades } from 'client/hooks/query/subaccount/usePaginatedSubaccountHistoricalTrades';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { OrderFillNotificationData } from 'client/modules/notifications/types';
import { getOrderDisplayType } from 'client/modules/trading/utils/getOrderDisplayType';
import { first } from 'lodash';
import { useEffect, useRef } from 'react';

export function useSubaccountFillOrderEventEmitter() {
  const {
    currentSubaccount: { address, name, chainEnv },
  } = useSubaccountContext();
  const { dispatchNotification } = useNotificationManagerContext();

  const { data: paginatedFillEvents } = usePaginatedSubaccountHistoricalTrades({
    pageSize: 10,
  });
  const latestFillOrderEvents = paginatedFillEvents?.pages[0];

  // Undefined = not yet initialized
  // Null = no fills after initialization
  const lastFillOrderSubmissionIdx = useRef<string | null | undefined>(
    undefined,
  );

  // Reset on subaccount & chainenv changes
  useEffect(() => {
    lastFillOrderSubmissionIdx.current = undefined;
  }, [address, name, chainEnv]);

  useEffect(
    () => {
      if (latestFillOrderEvents == null) {
        return;
      }
      const events = latestFillOrderEvents.events;
      // No order fills
      if (events.length === 0) {
        lastFillOrderSubmissionIdx.current = null;
        return;
      }
      // Populate first on load, without firing notifications
      if (lastFillOrderSubmissionIdx.current === undefined) {
        lastFillOrderSubmissionIdx.current =
          first(events)?.submissionIndex ?? null;
        return;
      }

      const eventsToEmit: OrderFillNotificationData[] = [];
      // Only emit 1 event max per order per update
      // Because events are in reverse chronological order, the first encountered will have the latest information
      const orderDigestsToEmit = new Set<string>();

      for (const event of events) {
        // Reached last emitted event
        if (event.submissionIndex === lastFillOrderSubmissionIdx.current) {
          break;
        }

        // Skip if already emitted for this order
        if (orderDigestsToEmit.has(event.digest)) {
          continue;
        }

        orderDigestsToEmit.add(event.digest);
        const baseFilled = event.cumulativeBaseFilled;

        const orderAppendix = unpackOrderAppendix(event.order.appendix);

        eventsToEmit.push({
          orderAppendix,
          digest: event.digest,
          orderDisplayType: getOrderDisplayType(orderAppendix),
          fillPrice: calcOrderFillPrice(
            event.cumulativeQuoteFilled,
            event.cumulativeFee,
            event.cumulativeBaseFilled,
          ),
          newOrderFilledAmount: baseFilled,
          productId: event.productId,
          totalAmount: toBigNumber(event.order.amount),
        });
      }
      // Reverse here so that the oldest events are dispatched first
      eventsToEmit.reverse().forEach((event) => {
        dispatchNotification({
          type: 'order_fill',
          data: event,
        });
      });

      // Populate last processed filled order id
      lastFillOrderSubmissionIdx.current = events[0].submissionIndex;
    },
    // Fire only on data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [latestFillOrderEvents],
  );
}
