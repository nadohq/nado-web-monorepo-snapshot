import { DEFAULT_TOAST_TTL } from 'client/components/Toast/consts';
import { OrderFillNotification } from 'client/modules/notifications/components/orders/OrderFillNotification/OrderFillNotification';
import {
  NotificationDispatchContext,
  OrderFillNotificationData,
} from 'client/modules/notifications/types';
import { toast } from 'sonner';

export function handleOrderFillNotificationDispatch(
  data: OrderFillNotificationData,
  { enableTradingNotifications }: NotificationDispatchContext,
) {
  // Enforce one toast per order
  const toastId = `order-fill-${data.digest}`;

  if (enableTradingNotifications) {
    toast.custom(
      (t) => {
        return (
          <OrderFillNotification
            data={data}
            ttl={DEFAULT_TOAST_TTL}
            onDismiss={() => {
              toast.dismiss(t);
            }}
          />
        );
      },
      { id: toastId, duration: DEFAULT_TOAST_TTL },
    );
  }
}
