import { asyncResult } from '@nadohq/client';
import { DEFAULT_TOAST_TTL } from 'client/components/Toast/consts';
import { ActionErrorNotification } from 'client/modules/notifications/components/ActionErrorNotification';
import { TradingCompEnrollSuccessNotification } from 'client/modules/notifications/components/TradingCompEnrollSuccessNotification';
import {
  NotificationDispatchContext,
  TradingCompEnrollNotificationData,
} from 'client/modules/notifications/types';
import { isUserDeniedError } from 'client/utils/errors/isUserDeniedError';
import { parseExecuteError } from 'client/utils/errors/parseExecuteError';
import { toast } from 'sonner';

const SUCCESS_TOAST_ID = 'trading-competition-enroll-success';

export async function handleTradingCompEnrollNotificationDispatch(
  { serverExecutionResult }: TradingCompEnrollNotificationData,
  { t }: NotificationDispatchContext,
) {
  const [, error] = await asyncResult(serverExecutionResult);

  if (!error) {
    toast.custom(
      (toastId) => (
        <TradingCompEnrollSuccessNotification
          ttl={DEFAULT_TOAST_TTL}
          onDismiss={() => {
            toast.dismiss(toastId);
          }}
        />
      ),
      { id: SUCCESS_TOAST_ID, duration: DEFAULT_TOAST_TTL },
    );
  } else if (!isUserDeniedError(error)) {
    const parsedError = parseExecuteError(t, error);
    toast.custom(
      (toastId) => (
        <ActionErrorNotification
          title={t(($) => $.errors.tradingCompetitionEnrollFailed)}
          error={parsedError}
          ttl={DEFAULT_TOAST_TTL}
          onDismiss={() => {
            toast.dismiss(toastId);
          }}
        />
      ),
      { duration: DEFAULT_TOAST_TTL },
    );
  }
}
