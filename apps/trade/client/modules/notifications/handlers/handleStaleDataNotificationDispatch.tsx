import { StaleDataNotification } from 'client/modules/notifications/components/StaleDataNotification';
import { toast } from 'sonner';

const STALE_DATA_TOAST_ID = 'staleData';

export function handleStaleDataNotificationDispatch() {
  toast.custom(
    (t) => <StaleDataNotification onDismiss={() => toast.dismiss(t)} />,
    {
      id: STALE_DATA_TOAST_ID,
      duration: Infinity,
    },
  );
}
