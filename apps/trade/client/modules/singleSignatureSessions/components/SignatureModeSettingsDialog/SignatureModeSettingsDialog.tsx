import { useSubaccountContext } from '@nadohq/react-client';
import { Icons } from '@nadohq/web-ui';
import { WarningPanel } from 'client/components/WarningPanel';
import { useIsSmartContractWalletConnected } from 'client/hooks/util/useIsSmartContractWalletConnected';
import { useDesktopWalletLinkConnector } from 'client/modules/app/desktopWalletLink/useDesktopWalletLinkConnector';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { SignatureModeDisable1CTDialogContent } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeDisable1CTDialogContent/SignatureModeDisable1CTDialogContent';
import { SignatureModeEnable1CTDialogContent } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeEnable1CTDialogContent/SignatureModeEnable1CTDialogContent';
import { SignatureModeInfo } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeInfo';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function SignatureModeSettingsDialog() {
  const { t } = useTranslation();
  const { hide } = useDialog();
  const { signingPreference } = useSubaccountContext();
  const { isDesktopWalletLinkConnected } = useDesktopWalletLinkConnector();
  const signingPreferenceIsSignOnce =
    signingPreference.current?.type === 'sign_once';
  const isSmartContractWalletConnected = useIsSmartContractWalletConnected();

  const [showDisable1CTContent, setShowDisable1CTContent] = useState<boolean>(
    signingPreferenceIsSignOnce,
  );

  // Ensure that content stays in sync with signing preference on initial load
  useEffect(() => {
    if (!signingPreference.didLoadPersistedValue) {
      return;
    }

    setShowDisable1CTContent(signingPreferenceIsSignOnce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signingPreference.didLoadPersistedValue]);

  const content = (() => {
    if (isDesktopWalletLinkConnected) {
      return (
        <>
          <SignatureModeInfo
            isSmartContractWalletConnected={isSmartContractWalletConnected}
          />
          <WarningPanel title={t(($) => $.oneClickTradingRequired)}>
            {t(($) => $.oneClickTradingRequiredForLinkedDesktopWallets)}
          </WarningPanel>
        </>
      );
    }

    return showDisable1CTContent ? (
      <SignatureModeDisable1CTDialogContent
        onDisableSuccess={() => setShowDisable1CTContent(false)}
        isSmartContractWalletConnected={isSmartContractWalletConnected}
      />
    ) : (
      <SignatureModeEnable1CTDialogContent
        onEnableSuccess={() => setShowDisable1CTContent(true)}
        isSmartContractWalletConnected={isSmartContractWalletConnected}
      />
    );
  })();

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.enableOneClickTrading)}
        <Icons.LightningFill size={18} className="text-accent" />
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>{content}</BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
