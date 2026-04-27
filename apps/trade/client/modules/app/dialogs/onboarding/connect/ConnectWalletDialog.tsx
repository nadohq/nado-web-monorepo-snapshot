import {
  KNOWN_CONNECTOR_IDS,
  useEVMContext,
  useQueryIpBlockStatus,
} from '@nadohq/react-client';
import { Divider, LinkButton } from '@nadohq/web-ui';
import { WarningPanel } from 'client/components/WarningPanel';
import { useRepeatedClickCountHandler } from 'client/hooks/ui/useRepeatedClickCountHandler';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useResolvedConnectors } from 'client/modules/app/dialogs/onboarding/connect/useResolvedConnectors';
import { WalletButton } from 'client/modules/app/dialogs/onboarding/connect/WalletButton';
import { LINKS } from 'common/brandMetadata/links';
import Link from 'next/link';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function ConnectWalletDialog() {
  const { t } = useTranslation();
  const { push, hide } = useDialog();
  const {
    connectionStatus,
    connect,
    connectors: baseConnectors,
  } = useEVMContext();
  const { connectorsWithMetadata } = useResolvedConnectors(baseConnectors);
  const { data: ipBlockStatus } = useQueryIpBlockStatus();
  const isGeoblocked = !!ipBlockStatus;

  const disableConnectButtons =
    connectionStatus.type === 'connecting' || isGeoblocked;

  // Close the dialog when connected. Ideally, `connect` takes some `onSuccess` callback that will then call `hide`
  // However, this does not guarantee that connections established through a browser extension will have the same behavior
  const isConnected = connectionStatus.type === 'connected';
  useEffect(() => {
    if (isConnected) {
      hide();
    }
  }, [hide, isConnected]);

  const geoblockWarningPanel = isGeoblocked ? (
    <WarningPanel title={t(($) => $.dialogTitles.restrictedTerritory)}>
      {t(($) => $.restrictedTerritoryNotice)}
    </WarningPanel>
  ) : null;

  const handleTitleClick = useRepeatedClickCountHandler({
    handler: (count) => {
      if (count === 3) {
        push({ type: 'connect_custom_wallet', params: {} });
      }
    },
  });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        <span onClick={handleTitleClick}>
          {t(($) => $.dialogTitles.connectWallet)}
        </span>
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        {geoblockWarningPanel}
        <div className="flex flex-col gap-y-3">
          {connectorsWithMetadata.map(({ connector, metadata }) => {
            const isLoading =
              connectionStatus.type === 'connecting' &&
              connector.id === connectionStatus.connector?.id;
            const onClick = () => {
              if (disableConnectButtons) {
                return;
              }
              // Desktop Wallet Link is a special case, we need to show the QR code scanner
              if (connector.id === KNOWN_CONNECTOR_IDS.desktopWalletLink) {
                push({
                  type: 'connect_desktop_wallet_link',
                  params: {},
                });
                return;
              }

              connect(connector);
            };

            return (
              <WalletButton
                key={connector.id}
                onClick={onClick}
                walletIcon={metadata.icon}
                walletName={metadata.name}
                isDisabled={disableConnectButtons}
                isLoading={isLoading}
                dataTestId={`connect-wallet-dialog-${connector.id}-button`}
              />
            );
          })}
        </div>
        <div className="flex flex-col gap-y-3">
          <div className="flex flex-col gap-y-1.5">
            <div className="text-text-primary">
              {t(($) => $.missingWalletPrompt)}
            </div>
            <div className="text-text-tertiary">
              {t(($) => $.walletConnectSupportsManyOptions)}
            </div>
          </div>
          <Divider />
          <div className="flex flex-col gap-y-1.5">
            <div className="text-text-primary">
              {t(($) => $.noWalletPrompt)}
            </div>
            <LinkButton
              as={Link}
              className="w-max"
              colorVariant="secondary"
              href={LINKS.ethWallets}
              external
              withExternalIcon
            >
              {t(($) => $.buttons.createWallet)}
            </LinkButton>
          </div>
        </div>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
