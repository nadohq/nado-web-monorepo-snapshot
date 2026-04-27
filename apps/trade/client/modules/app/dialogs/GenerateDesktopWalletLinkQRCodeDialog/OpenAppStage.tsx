'use client';

import { useSubaccountContext } from '@nadohq/react-client';
import { PrimaryButton } from '@nadohq/web-ui';
import { useBaseUrl } from 'client/hooks/util/useBaseUrl';
import { DesktopWalletLinkQRCodeErrorPanel } from 'client/modules/app/dialogs/GenerateDesktopWalletLinkQRCodeDialog/DesktopWalletLinkQRCodeErrorPanel';
import type { GenerateWalletLinkQRCodeError } from 'client/modules/app/dialogs/GenerateDesktopWalletLinkQRCodeDialog/GenerateDesktopWalletLinkQRCodeDialog';
import { useIsSingleSignatureSession } from 'client/modules/singleSignatureSessions/hooks/useIsSingleSignatureSession';
import { useRequiresApproveSignOnce } from 'client/modules/singleSignatureSessions/hooks/useRequiresApproveSignOnce';
import { getResolvedColorValue } from 'client/modules/theme/colorVars';
import { QRCodeSVG } from 'qrcode.react';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

type OpenAppStageProps = {
  onNext: () => void;
};

export function OpenAppStage({ onNext }: OpenAppStageProps) {
  const { t } = useTranslation();
  const baseUrl = useBaseUrl();
  const { signingPreference } = useSubaccountContext();
  const isSingleSignatureSession = useIsSingleSignatureSession();
  const requiresApproveSignOnce = useRequiresApproveSignOnce();

  const appLink = baseUrl ?? 'the app';
  const mobileLinkUrl = `${baseUrl}/?intent=desktopWalletLink`;
  const isSavePrivateKeyEnabled = !!signingPreference.current?.savePrivateKey;

  const generateWalletLinkQRCodeError =
    useMemo<GenerateWalletLinkQRCodeError | null>(() => {
      if (!isSingleSignatureSession) {
        return 'requires_single_signature_session';
      }
      if (requiresApproveSignOnce) {
        return 'requires_approve_sign_once';
      }
      if (!isSavePrivateKeyEnabled) {
        return 'requires_save_private_key';
      }
      return null;
    }, [
      isSavePrivateKeyEnabled,
      isSingleSignatureSession,
      requiresApproveSignOnce,
    ]);

  return (
    <>
      <p className="text-xs">
        <Trans
          i18nKey={($) => $.navigateToAppLinkWithYourMobileDevice}
          values={{ appLink }}
          components={{
            highlight: <span className="text-text-primary font-medium" />,
          }}
        />
      </p>
      <QRCodeSVG
        className="my-4 min-h-60 self-center"
        title={t(($) => $.imageAltText.mobileAppLinkQrCode)}
        // `marginSize` is used to increase the padding around the QR code.
        // This allows for easier scanning.
        marginSize={1}
        bgColor={getResolvedColorValue('surface-card')}
        fgColor={getResolvedColorValue('text-primary')}
        size={240}
        value={mobileLinkUrl}
      />
      <p className="text-text-secondary text-xs">
        {t(($) => $.revealInstructions)}
      </p>
      <DesktopWalletLinkQRCodeErrorPanel
        error={generateWalletLinkQRCodeError}
      />
      <PrimaryButton
        disabled={!!generateWalletLinkQRCodeError}
        onClick={onNext}
      >
        {t(($) => $.buttons.revealLoginQrCode)}
      </PrimaryButton>
    </>
  );
}
