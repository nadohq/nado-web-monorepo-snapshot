import { ClassicDepositUiNotification } from 'client/modules/notifications/components/ClassicDepositUiNotification';
import { toast } from 'sonner';

const TOAST_ID = 'classicDepositUiNotification';

export function handleClassicDepositUiNotificationDispatch() {
  toast.custom(
    (t) => <ClassicDepositUiNotification onDismiss={() => toast.dismiss(t)} />,
    {
      id: TOAST_ID,
      duration: Infinity,
    },
  );
}
