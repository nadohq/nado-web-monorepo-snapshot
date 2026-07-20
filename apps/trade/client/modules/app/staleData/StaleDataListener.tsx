import { useTimeout } from 'ahooks';
import { useAnalyticsContext } from 'client/modules/analytics/AnalyticsContext';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { useEngineSubscriptionsWebSocket } from 'client/modules/webSockets/hooks/useEngineSubscriptionsWebSocket';
import { noop } from 'lodash';

const WS_DISCONNECT_THRESHOLD_MS = 30_000;

/**
 * Dispatches a sticky "stale data" toast when the user's view of the app
 * may have drifted from the engine.
 */
export function StaleDataListener() {
  const { dispatchNotification } = useNotificationManagerContext();
  const { sendGTMEvent } = useAnalyticsContext();
  const { isActiveWebSocket } = useEngineSubscriptionsWebSocket({
    onMessage: noop,
  });

  useTimeout(
    () => {
      dispatchNotification({ type: 'stale_data' });
      sendGTMEvent({ event: 'stale_data' });
    },
    isActiveWebSocket ? undefined : WS_DISCONNECT_THRESHOLD_MS,
  );

  return null;
}
