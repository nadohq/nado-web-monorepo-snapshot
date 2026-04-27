import { ActionToast } from 'client/components/Toast/ActionToast/ActionToast';
import { Toast } from 'client/components/Toast/Toast';
import { ToastProps } from 'client/components/Toast/types';
import { useTranslation } from 'react-i18next';

/** USDC Explorer base URL for tracking cross-chain transfers. */
const USDC_EXPLORER_BASE_URL = 'https://usdc.range.org';

interface Props extends ToastProps {
  /** Connected wallet address of the user. */
  address: string;
}

/**
 * Toast notification shown when a CCTP bridge is initiated.
 * Includes a link to the USDC Explorer for tracking the cross-chain transfer.
 */
export function CctpBridgeNotification({ address, ttl, onDismiss }: Props) {
  const { t } = useTranslation();

  return (
    <ActionToast.Container>
      <ActionToast.TextHeader variant="success" onDismiss={onDismiss}>
        {t(($) => $.notifications.bridgeInitiated.title)}
      </ActionToast.TextHeader>
      <ActionToast.Separator variant="success" ttl={ttl} />
      <ActionToast.Body variant="success" className="flex flex-col gap-y-2">
        <p>{t(($) => $.notifications.bridgeInitiated.description)}</p>
        <Toast.FooterLink
          href={`${USDC_EXPLORER_BASE_URL}/transactions?s=${address}`}
          external
        >
          {t(($) => $.notifications.bridgeInitiated.trackOnExplorer)}
        </Toast.FooterLink>
      </ActionToast.Body>
    </ActionToast.Container>
  );
}
