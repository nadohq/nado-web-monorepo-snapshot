import { asyncResult } from '@nadohq/client';
import { DEFAULT_TOAST_TTL } from 'client/components/Toast/consts';
import { ActionErrorNotification } from 'client/modules/notifications/components/ActionErrorNotification';
import {
  CloseMultiPositionsNotificationData,
  NotificationDispatchContext,
} from 'client/modules/notifications/types';
import { createToastId } from 'client/utils/createToastId';
import { isUserDeniedError } from 'client/utils/errors/isUserDeniedError';
import { parseExecuteError } from 'client/utils/errors/parseExecuteError';
import { toast } from 'sonner';

export async function handleCloseMultiPositionsNotificationDispatch(
  { executeResult }: CloseMultiPositionsNotificationData,
  { t }: NotificationDispatchContext,
) {
  const [, error] = await asyncResult(executeResult);

  if (error && !isUserDeniedError(error)) {
    toast.custom(
      (toastId) => {
        return (
          <ActionErrorNotification
            title={t(($) => $.errors.positionsFailedToClose)}
            error={parseExecuteError(t, error)}
            ttl={DEFAULT_TOAST_TTL}
            onDismiss={() => {
              toast.dismiss(toastId);
            }}
          />
        );
      },
      { id: createToastId('closeMultiPositions'), duration: DEFAULT_TOAST_TTL },
    );
  }
}
