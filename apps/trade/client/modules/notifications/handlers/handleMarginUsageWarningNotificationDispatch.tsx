import { MarginUsageWarningNotification } from 'client/modules/notifications/components/risk/MarginUsageWarningNotification';
import { toast } from 'sonner';

export const MARGIN_USAGE_WARNING_TOAST_ID = 'marginUsageWarning';

export function handleMarginUsageWarningNotificationDispatch() {
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
}
