import { USDT0_INK, useEVMContext } from '@nadohq/react-client';
import { LinkButton } from '@nadohq/web-ui';
import {
  USDC_BRIDGE_EXPLORER_BASE_URL,
  USDC_TOKEN_INFO,
} from 'client/modules/collateral/deposit/CctpBridgeDialog/config';
import { LAYER_ZERO_SCAN_BASE_URL } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/config';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function PendingDepositsLinks() {
  const { t } = useTranslation();
  const {
    connectionStatus: { address },
  } = useEVMContext();

  if (!address) {
    return null;
  }

  const usdtUrl = `${LAYER_ZERO_SCAN_BASE_URL}/address/${address}`;
  const usdcUrl = `${USDC_BRIDGE_EXPLORER_BASE_URL}/transactions?sc=INTERCHAIN&s=${address}`;

  return (
    // y-padding to roughly match the subtab buttons on trade tab
    <div className="text-text-tertiary flex items-center gap-x-2 px-3 py-3.5 text-xs">
      <span className="text-text-primary">
        {t(($) => $.pendingBridgeDeposits)}:
      </span>
      <LinkButton
        as={Link}
        colorVariant="secondary"
        href={usdtUrl}
        external
        withExternalIcon
      >
        USDT/{USDT0_INK.symbol}
      </LinkButton>
      <LinkButton
        as={Link}
        colorVariant="secondary"
        href={usdcUrl}
        external
        withExternalIcon
      >
        {USDC_TOKEN_INFO.symbol}
      </LinkButton>
    </div>
  );
}
