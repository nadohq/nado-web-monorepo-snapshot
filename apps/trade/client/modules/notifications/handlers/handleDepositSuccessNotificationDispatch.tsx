import { DEFAULT_TOAST_TTL } from 'client/components/Toast/consts';
import { DepositSuccessNotification } from 'client/modules/notifications/components/deposits/DepositSuccessNotification';
import { DepositNotificationData } from 'client/modules/notifications/types';
import { toast } from 'sonner';

export function handleDepositSuccessNotificationDispatch(
  data: DepositNotificationData,
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
}
