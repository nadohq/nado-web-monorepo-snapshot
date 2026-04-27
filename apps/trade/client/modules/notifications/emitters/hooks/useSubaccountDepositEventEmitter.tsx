import { useSubaccountContext } from '@nadohq/react-client';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { usePaginatedSubaccountCollateralEvents } from 'client/hooks/query/subaccount/usePaginatedSubaccountCollateralEvents';
import { getDepositCollateralEvent } from 'client/modules/events/collateral/getDepositCollateralEvent';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { DepositNotificationData } from 'client/modules/notifications/types';
import { first } from 'lodash';
import { useEffect, useRef } from 'react';

export function useSubaccountDepositEventEmitter() {
  const {
    currentSubaccount: { address, name, chainEnv },
  } = useSubaccountContext();
  const { data: paginatedDepositEvents } =
    usePaginatedSubaccountCollateralEvents({
      pageSize: 10,
      eventTypes: ['deposit_collateral'],
    });
  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const { dispatchNotification } = useNotificationManagerContext();

  const latestDepositEvents = first(paginatedDepositEvents?.pages);

  const lastDepositSubmissionIdxRef = useRef<string | null | undefined>(
    undefined,
  );

  // Reset on subaccount & chainenv changes
  useEffect(() => {
    lastDepositSubmissionIdxRef.current = undefined;
  }, [address, name, chainEnv]);

  useEffect(
    () => {
      if (latestDepositEvents == null || allMarketsStaticData == null) {
        return;
      }

      const events = latestDepositEvents.events;

      // No deposit events
      if (events.length === 0) {
        lastDepositSubmissionIdxRef.current = null;
        return;
      }

      // Populate first on load, without firing notifications
      if (lastDepositSubmissionIdxRef.current === undefined) {
        lastDepositSubmissionIdxRef.current =
          first(events)?.submissionIndex ?? null;
        return;
      }

      const eventsToEmit: DepositNotificationData[] = [];

      const submissionIndexesToEmit = new Set<string>();

      for (const event of events) {
        // Reached last emitted event
        if (event.submissionIndex === lastDepositSubmissionIdxRef.current) {
          break;
        }

        // Skip if already emitted for this event
        if (submissionIndexesToEmit.has(event.submissionIndex)) {
          continue;
        }

        submissionIndexesToEmit.add(event.submissionIndex);

        const depositEvent = getDepositCollateralEvent({
          event,
          allMarketsStaticData,
        });

        eventsToEmit.push({
          amount: depositEvent.amount,
          symbol: depositEvent.token.symbol,
          icon: depositEvent.token.icon,
          valueUsd: depositEvent.valueUsd,
          submissionIndex: depositEvent.submissionIndex,
        });
      }

      // Reverse here so that the oldest events are dispatched first
      eventsToEmit.reverse().forEach((depositData) => {
        dispatchNotification({
          type: 'deposit_success',
          data: depositData,
        });
      });

      lastDepositSubmissionIdxRef.current = events[0]?.submissionIndex;
    },
    // Fire only on data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [latestDepositEvents, allMarketsStaticData],
  );
}
