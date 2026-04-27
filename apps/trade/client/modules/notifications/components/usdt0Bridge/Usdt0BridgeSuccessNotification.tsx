import { Icons, LinkButton } from '@nadohq/web-ui';
import { ActionToast } from 'client/components/Toast/ActionToast/ActionToast';
import { ToastProps } from 'client/components/Toast/types';
import { LAYER_ZERO_SCAN_BASE_URL } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/config';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface Props extends ToastProps {
  data: { txHash: string };
}

/**
 * Success notification for USDT0 bridge transactions.
 * Shows a link to LayerZero Scan to track cross-chain message delivery.
 */
export function Usdt0BridgeSuccessNotification({
  data,
  onDismiss,
  ttl,
}: Props) {
  const { t } = useTranslation();
  const layerZeroScanUrl = `${LAYER_ZERO_SCAN_BASE_URL}/tx/${data.txHash}`;

  return (
    <ActionToast.Container>
      <ActionToast.TextHeader
        variant="success"
        icon={Icons.CheckCircle}
        onDismiss={onDismiss}
      >
        {t(($) => $.notifications.usdt0BridgeSuccess.title)}
      </ActionToast.TextHeader>
      <ActionToast.Separator variant="success" ttl={ttl} />
      <ActionToast.Body
        variant="success"
        className="flex flex-col items-start gap-y-3"
      >
        <p>{t(($) => $.notifications.usdt0BridgeSuccess.description)}</p>
        <LinkButton
          as={Link}
          colorVariant="primary"
          href={layerZeroScanUrl}
          external
          withExternalIcon
        >
          {t(($) => $.notifications.usdt0BridgeSuccess.layerZeroScan)}
        </LinkButton>
      </ActionToast.Body>
    </ActionToast.Container>
  );
}
