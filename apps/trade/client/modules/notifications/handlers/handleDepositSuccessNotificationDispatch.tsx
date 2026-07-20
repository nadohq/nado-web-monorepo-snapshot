import { DEFAULT_TOAST_TTL } from 'client/components/Toast/consts';
import { DepositSuccessNotification } from 'client/modules/notifications/components/deposits/DepositSuccessNotification';
import {
  DepositNotificationData,
  NotificationDispatchContext,
} from 'client/modules/notifications/types';
import { toast } from 'sonner';

export function handleDepositSuccessNotificationDispatch(
  data: DepositNotificationData,
  { sendGTMEvent }: NotificationDispatchContext,
) {
  // Enforce one toast per deposit event using submission index
  const toastId = `deposit-${data.submissionIndex}`;

  toast.custom(
    (t) => {
      return (
        <DepositSuccessNotification
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

  sendGTMEvent({
    event: 'deposit_success',
    asset: data.symbol,
    submissionIndex: data.submissionIndex,
    valueUsd: Math.round(data.valueUsd.toNumber()),
  });
}
