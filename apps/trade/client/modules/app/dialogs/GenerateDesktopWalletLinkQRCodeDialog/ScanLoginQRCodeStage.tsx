'use client';

import { ErrorPanel } from 'client/components/ErrorPanel';
import { WarningPanel } from 'client/components/WarningPanel';
import { useDesktopWalletLinkUri } from 'client/modules/app/desktopWalletLink/useDesktopWalletLinkUri';
import { getResolvedColorValue } from 'client/modules/theme/colorVars';
import { QRCodeSVG } from 'qrcode.react';
import { Trans, useTranslation } from 'react-i18next';

export function ScanLoginQRCodeStage() {
  const { t } = useTranslation();

  const desktopWalletLinkUri = useDesktopWalletLinkUri();

  return (
    <>
      <WarningPanel title={t(($) => $.important)}>
        {t(($) => $.qrCodeLoginDescription)}
        <br />
        {t(($) => $.qrCodeTrustWarning)}
        <p>
          <Trans
            i18nKey={($) => $.onChainActionsNotAvailableNote}
            components={{
              highlight: <span className="text-text-primary font-medium" />,
            }}
          />
        </p>
      </WarningPanel>
      {desktopWalletLinkUri ? (
        <QRCodeSVG
          className="min-h-60 self-center"
          title={t(($) => $.nadoDesktopWalletLink)}
          // `marginSize` is used to increase the padding around the QR code.
          // This allows for easier scanning.
          marginSize={1}
          bgColor={getResolvedColorValue('surface-card')}
          fgColor={getResolvedColorValue('text-primary')}
          size={260}
          value={desktopWalletLinkUri}
        />
      ) : (
        <ErrorPanel>{t(($) => $.errors.failedToGenerateQrCode)}</ErrorPanel>
      )}
    </>
  );
}
