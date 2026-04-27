import { SmartContractWalletHelperNotification } from 'client/modules/notifications/components/SmartContractWalletHelperNotification';
import { toast } from 'sonner';

export const SMART_CONTRACT_WALLET_HELPER_TOAST_ID =
  'smartContractWalletHelper';

export function handleSmartContractWalletHelperNotificationDispatch() {
  toast.custom(
    (t) => {
      return (
        <SmartContractWalletHelperNotification
          onDismiss={() => {
            toast.dismiss(t);
          }}
        />
      );
    },
    { id: SMART_CONTRACT_WALLET_HELPER_TOAST_ID, duration: Infinity },
  );
}
