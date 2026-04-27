import { asyncResult } from '@nadohq/client';
import { DEFAULT_TOAST_TTL } from 'client/components/Toast/consts';
import { ActionErrorNotification } from 'client/modules/notifications/components/ActionErrorNotification';
import { CancelMultiOrdersSuccessNotification } from 'client/modules/notifications/components/orders/CancelMultiOrdersSuccessNotification';
import {
  CancelMultiOrdersNotificationData,
  NotificationDispatchContext,
} from 'client/modules/notifications/types';
import { isUserDeniedError } from 'client/utils/errors/isUserDeniedError';
import { parseExecuteError } from 'client/utils/errors/parseExecuteError';
import { toast } from 'sonner';

export async function handleCancelMultiOrdersNotificationDispatch(
  { serverExecutionResult, numOrders }: CancelMultiOrdersNotificationData,
  { t, enableTradingNotifications }: NotificationDispatchContext,
) {
  const [, serverStatusError] = await asyncResult(serverExecutionResult);

  if (!serverStatusError) {
    if (enableTradingNotifications) {
      toast.custom(
        (toastId) => {
          return (
            <CancelMultiOrdersSuccessNotification
              numOrders={numOrders}
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
  } else if (!isUserDeniedError(serverStatusError)) {
    toast.custom(
      (toastId) => {
        return (
          <ActionErrorNotification
            title={t(($) => $.errors.cancelOrdersFailed)}
            error={parseExecuteError(t, serverStatusError)}
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
