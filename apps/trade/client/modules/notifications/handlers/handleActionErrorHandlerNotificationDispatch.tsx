import { asyncResult } from '@nadohq/client';
import { DEFAULT_TOAST_TTL } from 'client/components/Toast/consts';
import { ActionErrorNotification } from 'client/modules/notifications/components/ActionErrorNotification';
import {
  ActionErrorHandlerNotificationData,
  NotificationDispatchContext,
} from 'client/modules/notifications/types';
import { createToastId } from 'client/utils/createToastId';
import { isUserDeniedError } from 'client/utils/errors/isUserDeniedError';
import { parseExecuteError } from 'client/utils/errors/parseExecuteError';
import { toast } from 'sonner';

export async function handleActionErrorHandlerNotificationDispatch(
  data: ActionErrorHandlerNotificationData,
  { t, getConfirmedTx }: NotificationDispatchContext,
) {
  const toastId = createToastId('action_error_handler');
  const executionData = data.executionData;

  let error: unknown | undefined;
  if ('serverExecutionResult' in executionData) {
    const [, serverError] = await asyncResult(
      executionData.serverExecutionResult,
    );
    error = serverError;
  } else {
    const [, txError] = await asyncResult(
      getConfirmedTx(executionData.txHashPromise),
    );
    error = txError;
  }

  if (error && !isUserDeniedError(error)) {
    toast.custom(
      (toastId) => {
        return (
          <ActionErrorNotification
            title={data.errorNotificationTitle}
            error={parseExecuteError(t, error)}
            ttl={DEFAULT_TOAST_TTL}
            onDismiss={() => {
              toast.dismiss(toastId);
            }}
          />
        );
      },
      { id: toastId, duration: DEFAULT_TOAST_TTL },
    );
  }
}
