import { MarginUsageWarningNotification } from 'client/modules/notifications/components/risk/MarginUsageWarningNotification';
import { NotificationDispatchContext } from 'client/modules/notifications/types';
import { toast } from 'sonner';

export const MARGIN_USAGE_WARNING_TOAST_ID = 'marginUsageWarning';

export function handleMarginUsageWarningNotificationDispatch({
  sendGTMEvent,
}: NotificationDispatchContext) {
  toast.custom(
    (t) => {
      return (
        <MarginUsageWarningNotification
          onDismiss={() => {
            toast.dismiss(t);
          }}
        />
      );
    },
    {
      id: MARGIN_USAGE_WARNING_TOAST_ID,
      duration: Infinity,
    },
  );

  sendGTMEvent({
    event: 'initial_margin_usage_warning',
  });
}
