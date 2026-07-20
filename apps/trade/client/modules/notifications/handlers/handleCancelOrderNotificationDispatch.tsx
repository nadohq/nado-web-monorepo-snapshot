import { asyncResult } from '@nadohq/client';
import { DEFAULT_TOAST_TTL } from 'client/components/Toast/consts';
import { ActionErrorNotification } from 'client/modules/notifications/components/ActionErrorNotification';
import { CancelOrderSuccessNotification } from 'client/modules/notifications/components/orders/CancelOrderSuccessNotification';
import {
  CancelOrderNotificationData,
  NotificationDispatchContext,
} from 'client/modules/notifications/types';
import { isUserDeniedError } from 'client/utils/errors/isUserDeniedError';
import { parseExecuteError } from 'client/utils/errors/parseExecuteError';
import { toast } from 'sonner';

export async function handleCancelOrderNotificationDispatch(
  cancelOrderNotificationData: CancelOrderNotificationData,
  { t, enableTradingNotifications, sendGTMEvent }: NotificationDispatchContext,
) {
  const { cancelOrderParams } = cancelOrderNotificationData;

  const [, serverStatusError] = await asyncResult(
    cancelOrderNotificationData.serverExecutionResult,
  );

  if (!serverStatusError) {
    if (enableTradingNotifications) {
      toast.custom(
        (toastId) => {
          return (
            <CancelOrderSuccessNotification
              data={cancelOrderParams}
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

    sendGTMEvent({
      event: 'cancel_order',
      market: cancelOrderParams.metadata.marketName,
    });
  } else if (!isUserDeniedError(serverStatusError)) {
    const parsedError = parseExecuteError(t, serverStatusError);
    toast.custom(
      (toastId) => {
        return (
          <ActionErrorNotification
            title={t(($) => $.errors.cancelOrderFailed)}
            error={parsedError}
            ttl={DEFAULT_TOAST_TTL}
            onDismiss={() => {
              toast.dismiss(toastId);
            }}
          />
        );
      },
      { duration: DEFAULT_TOAST_TTL },
    );

    sendGTMEvent({
      event: 'cancel_order_error',
      market: cancelOrderParams.metadata.marketName,
      errorMessage: parsedError.errorMessage,
    });
  }
}
