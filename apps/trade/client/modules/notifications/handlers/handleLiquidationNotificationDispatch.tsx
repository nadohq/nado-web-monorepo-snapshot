import { LiquidationNotification } from 'client/modules/notifications/components/risk/LiquidationNotification';
import {
  LiquidationNotificationData,
  NotificationDispatchContext,
} from 'client/modules/notifications/types';
import { createToastId } from 'client/utils/createToastId';
import { toast } from 'sonner';

export function handleLiquidationNotificationDispatch(
  liquidationNotificationData: LiquidationNotificationData,
  { sendGTMEvent }: NotificationDispatchContext,
) {
  const toastId = createToastId('liquidationWarning');

  toast.custom(
    (t) => {
      return (
        <LiquidationNotification
          data={liquidationNotificationData}
          ttl={10000}
          onDismiss={() => {
            toast.dismiss(t);
          }}
        />
      );
    },
    {
      id: toastId,
      duration: 10000,
    },
  );

  sendGTMEvent({ event: 'liquidation' });
}
