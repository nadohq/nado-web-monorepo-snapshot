import { asyncResult } from '@nadohq/client';
import { DEFAULT_TOAST_TTL } from 'client/components/Toast/consts';
import { ActionErrorNotification } from 'client/modules/notifications/components/ActionErrorNotification';
import { Usdt0BridgeSuccessNotification } from 'client/modules/notifications/components/usdt0Bridge/Usdt0BridgeSuccessNotification';
import {
  NotificationDispatchContext,
  Usdt0BridgeNotificationData,
} from 'client/modules/notifications/types';
import { isUserDeniedError } from 'client/utils/errors/isUserDeniedError';
import { parseExecuteError } from 'client/utils/errors/parseExecuteError';
import { toast } from 'sonner';
import { isHex } from 'viem';

/**
 * Awaits only the tx hash — on-chain receipt tracking is handled by
 * useQueryOnChainTransactionState to avoid duplicate RPC polling.
 */
export async function handleUsdt0BridgeNotificationDispatch(
  data: Usdt0BridgeNotificationData,
  { t }: Pick<NotificationDispatchContext, 't'>,
) {
  const [txHash, bridgeError] = await asyncResult(data.txHashPromise);

  if (!bridgeError && txHash && isHex(txHash)) {
    toast.custom(
      (toastId) => {
        return (
          <Usdt0BridgeSuccessNotification
            data={{ txHash }}
            ttl={Infinity}
            onDismiss={() => {
              toast.dismiss(toastId);
            }}
          />
        );
      },
      {
        id: `usdt0-bridge-${txHash}`,
        duration: Infinity,
      },
    );
  } else if (bridgeError && !isUserDeniedError(bridgeError)) {
    toast.custom(
      (toastId) => {
        return (
          <ActionErrorNotification
            title={t(($) => $.errors.depositFailed)}
            error={parseExecuteError(t, bridgeError)}
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
