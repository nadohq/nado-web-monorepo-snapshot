import { Scanner } from '@yudiel/react-qr-scanner';
import { useDesktopWalletLinkConnector } from 'client/modules/app/desktopWalletLink/useDesktopWalletLinkConnector';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { Trans, useTranslation } from 'react-i18next';

export function ConnectDesktopWalletLinkDialog() {
  const { t } = useTranslation();
  const { hide } = useDialog();
  const { connectWithDesktopWalletLink } = useDesktopWalletLinkConnector();

  const handleQRScan = (scannedValue: string | undefined) => {
    if (!scannedValue) {
      return;
    }

    connectWithDesktopWalletLink(scannedValue);
    hide();
  };

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.desktopWalletLink)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <div className="text-text-secondary flex flex-col gap-y-1 text-xs">
          <p>{t(($) => $.scanQrCodeToLogin)}</p>
          <p>
            <Trans
              i18nKey={($) => $.onChainActionsNotAvailableNote}
              components={{
                highlight: <span className="text-text-primary" />,
              }}
            />
          </p>
        </div>

        <Scanner
          classNames={{
            container: 'rounded-md',
          }}
          onScan={(result) => {
            handleQRScan(result?.[0]?.rawValue);
          }}
          sound={false}
          components={{
            onOff: false,
            zoom: false,
            torch: false,
            finder: false,
          }}
        />
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
