import { asyncResult } from '@nadohq/client';
import { DEFAULT_TOAST_TTL } from 'client/components/Toast/consts';
import { ActionErrorNotification } from 'client/modules/notifications/components/ActionErrorNotification';
import { PlaceOrderSuccessNotification } from 'client/modules/notifications/components/orders/PlaceOrderSuccessNotification';
import {
  NotificationDispatchContext,
  PlaceOrderNotificationData,
} from 'client/modules/notifications/types';
import { getPlaceOrderTypeLabel } from 'client/modules/trading/utils/getPlaceOrderTypeLabel';
import { isUserDeniedError } from 'client/utils/errors/isUserDeniedError';
import { parseExecuteError } from 'client/utils/errors/parseExecuteError';
import { first } from 'lodash';
import { toast } from 'sonner';

export async function handlePlaceOrderNotificationDispatch(
  placeOrderNotificationData: PlaceOrderNotificationData,
  { t, enableTradingNotifications }: NotificationDispatchContext,
) {
  const verifyOrderActionResult = async () => {
    const awaitedResult = await placeOrderNotificationData.executeResult;

    return first(awaitedResult.data)?.digest;
  };

  const [digest, orderActionError] = await asyncResult(
    verifyOrderActionResult(),
  );

  if (!orderActionError) {
    if (enableTradingNotifications) {
      toast.custom(
        (toastId) => {
          return (
            <PlaceOrderSuccessNotification
              ttl={DEFAULT_TOAST_TTL}
              orderData={placeOrderNotificationData}
              onDismiss={() => {
                toast.dismiss(toastId);
              }}
            />
          );
        },
        { id: `place-order-${digest}`, duration: DEFAULT_TOAST_TTL },
      );
    }
  } else if (!isUserDeniedError(orderActionError)) {
    toast.custom(
      (toastId) => {
        return (
          <ActionErrorNotification
            title={t(($) => $.errors.orderTypeOrderFailed, {
              orderType: getPlaceOrderTypeLabel(
                t,
                placeOrderNotificationData.orderType,
              ),
            })}
            error={parseExecuteError(t, orderActionError)}
            ttl={DEFAULT_TOAST_TTL}
            onDismiss={() => {
              toast.dismiss(toastId);
            }}
          />
        );
      },
      { duration: DEFAULT_TOAST_TTL },
    );
  }
}
