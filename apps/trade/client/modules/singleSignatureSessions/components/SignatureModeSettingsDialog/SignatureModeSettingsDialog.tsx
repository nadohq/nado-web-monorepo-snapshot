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
import { useTranslation } from 'react-i18next';

export function SignatureModeSettingsDialog() {
  const { t } = useTranslation();
  const { hide } = useDialog();
  const { signingPreference } = useSubaccountContext();
  const { isDesktopWalletLinkConnected } = useDesktopWalletLinkConnector();
  const isSmartContractWalletConnected = useIsSmartContractWalletConnected();

  // Wait for the persisted preference so we don't flash the wrong panel before it loads.
  if (!signingPreference.didLoadPersistedValue) {
    return null;
  }

  const signingPreferenceIsSignOnce =
    signingPreference.current?.type === 'sign_once';

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

    return signingPreferenceIsSignOnce ? (
      <SignatureModeDisable1CTDialogContent
        isSmartContractWalletConnected={isSmartContractWalletConnected}
      />
    ) : (
      <SignatureModeEnable1CTDialogContent
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
