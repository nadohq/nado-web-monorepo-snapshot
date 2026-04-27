import { CctpBridgeNotification } from 'client/modules/collateral/deposit/CctpBridgeDialog/components/CctpBridgeNotification';
import { CctpBridgeNotificationData } from 'client/modules/notifications/types';
import { toast } from 'sonner';

const TOAST_ID = 'cctp-bridge';

export function handleCctpBridgeNotificationDispatch(
  data: CctpBridgeNotificationData,
) {
  toast.custom(
    (t) => {
      return (
        <CctpBridgeNotification
          address={data.address}
          ttl={Infinity}
          onDismiss={() => {
            toast.dismiss(t);
          }}
        />
      );
    },
    { id: TOAST_ID, duration: Infinity },
  );
}
