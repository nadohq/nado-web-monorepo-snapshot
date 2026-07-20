import { MaintMarginUsageNotification } from 'client/modules/notifications/components/risk/MaintMarginUsageNotification';
import {
  MaintMarginUsageNotificationData,
  NotificationDispatchContext,
} from 'client/modules/notifications/types';
import { toast } from 'sonner';

export const MAINT_MARGIN_USAGE_WARNING_TOAST_ID = 'maintMarginUsageWarning';

export function handleMaintMarginUsageNotificationDispatch(
  maintMarginUsageNotificationData: MaintMarginUsageNotificationData,
  { sendGTMEvent }: NotificationDispatchContext,
) {
  toast.custom(
    (t) => {
      return (
        <MaintMarginUsageNotification
          data={maintMarginUsageNotificationData}
          onDismiss={() => {
            toast.dismiss(t);
          }}
        />
      );
    },
    {
      id: MAINT_MARGIN_USAGE_WARNING_TOAST_ID,
      duration: Infinity,
    },
  );

  sendGTMEvent({
    event: 'maint_margin_usage_warning',
    marginUsageFraction:
      maintMarginUsageNotificationData.maintMarginUsageFraction.toNumber(),
  });
}
