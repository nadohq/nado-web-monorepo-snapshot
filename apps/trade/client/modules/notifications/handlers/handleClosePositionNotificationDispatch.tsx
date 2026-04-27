import { asyncResult } from '@nadohq/client';
import { DEFAULT_TOAST_TTL } from 'client/components/Toast/consts';
import { ActionErrorNotification } from 'client/modules/notifications/components/ActionErrorNotification';
import { ClosePositionSuccessNotification } from 'client/modules/notifications/components/positions/ClosePositionSuccessNotification';
import {
  ClosePositionNotificationData,
  NotificationDispatchContext,
} from 'client/modules/notifications/types';
import { isUserDeniedError } from 'client/utils/errors/isUserDeniedError';
import { parseExecuteError } from 'client/utils/errors/parseExecuteError';
import { toast } from 'sonner';

export async function handleClosePositionNotificationDispatch(
  closePositionNotificationData: ClosePositionNotificationData,
  { t, enableTradingNotifications }: NotificationDispatchContext,
) {
  const { closePositionParams } = closePositionNotificationData;

  const verifyOrderActionResult = async () => {
    await closePositionNotificationData.executeResult;
  };

  const [, orderActionError] = await asyncResult(verifyOrderActionResult());

  if (!orderActionError) {
    if (enableTradingNotifications) {
      toast.custom(
        (toastId) => {
          return (
            <ClosePositionSuccessNotification
              data={closePositionParams}
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
  } else if (!isUserDeniedError(orderActionError)) {
    toast.custom(
      (toastId) => {
        return (
          <ActionErrorNotification
            title={t(($) => $.errors.closePositionFailed)}
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
