import { ErrorBoundary } from 'client/components/ErrorBoundary';
import { ChangeSubaccountDialog } from 'client/modules/app/dialogs/ChangeSubaccountDialog';
import { GenerateDesktopWalletLinkQRCodeDialog } from 'client/modules/app/dialogs/GenerateDesktopWalletLinkQRCodeDialog/GenerateDesktopWalletLinkQRCodeDialog';
import { HelpCenterDialog } from 'client/modules/app/dialogs/HelpCenterDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { LocationRestrictedDialog } from 'client/modules/app/dialogs/LocationRestrictedDialog';
import { ConnectWalletDialog } from 'client/modules/app/dialogs/onboarding/connect/ConnectWalletDialog';
import { ConnectCustomWalletDialog } from 'client/modules/app/dialogs/onboarding/connectCustomWallet/ConnectCustomWalletDialog';
import { ConnectDesktopWalletLinkDialog } from 'client/modules/app/dialogs/onboarding/ConnectDesktopWalletLinkDialog';
import { KeyFeaturesDialog } from 'client/modules/app/dialogs/onboarding/keyFeatures/KeyFeaturesDialog';
import { TermsOfUseDialog } from 'client/modules/app/dialogs/onboarding/TermsOfUseDialog';
import { NotifiContextProviderWrapper } from 'client/modules/notifi/NotifiContextProviderWrapper';
import { NotifiDialog } from 'client/modules/notifi/NotifiDialog';
import { SettingsDialog } from 'client/modules/settings/SettingsDialog';
import { SignatureModeSettingsDialog } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeSettingsDialog';
import { SignatureModeSlowModeSettingsDialog } from 'client/modules/singleSignatureSessions/components/SignatureModeSlowModeSettingsDialog/SignatureModeSlowModeSettingsDialog';
import { SingleSignatureReapprovalDialog } from 'client/modules/singleSignatureSessions/components/SingleSignatureReapprovalDialog/SingleSignatureReapprovalDialog';
import { AddSubaccountDialog } from 'client/modules/subaccounts/components/dialogs/AddSubaccountDialog/AddSubaccountDialog';
import { EditSubaccountProfileDialog } from 'client/modules/subaccounts/components/dialogs/EditSubaccountProfileDialog/EditSubaccountProfileDialog';
import { ManageSubaccountsDialog } from 'client/modules/subaccounts/components/dialogs/ManageSubaccountsDialog/ManageSubaccountsDialog';
import { SubaccountQuoteTransferDialog } from 'client/modules/subaccounts/components/dialogs/SubaccountQuoteTransferDialog/SubaccountQuoteTransferDialog';
import { ExportHistoryDialog } from 'client/pages/Portfolio/subpages/History/exportHistory/ExportHistoryDialog';

export function AccountDialogs() {
  const { currentDialog } = useDialog();

  return (
    <>
      {currentDialog?.type === 'location_restricted' && (
        <LocationRestrictedDialog />
      )}
      {currentDialog?.type === 'connect' && <ConnectWalletDialog />}
      {currentDialog?.type === 'connect_custom_wallet' && (
        <ConnectCustomWalletDialog />
      )}
      {currentDialog?.type === 'connect_desktop_wallet_link' && (
        <ConnectDesktopWalletLinkDialog />
      )}
      {currentDialog?.type === 'terms_of_use' && <TermsOfUseDialog />}
      {currentDialog?.type === 'key_features' && <KeyFeaturesDialog />}
      {currentDialog?.type === 'manage_subaccounts' && (
        <ManageSubaccountsDialog />
      )}
      {currentDialog?.type === 'create_subaccount' && <AddSubaccountDialog />}
      {currentDialog?.type === 'change_subaccount' && (
        <ChangeSubaccountDialog />
      )}
      {currentDialog?.type === 'subaccount_quote_transfer' && (
        <SubaccountQuoteTransferDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'signature_mode_settings' && (
        <SignatureModeSettingsDialog />
      )}
      {currentDialog?.type === 'signature_mode_slow_mode_settings' && (
        <SignatureModeSlowModeSettingsDialog />
      )}
      {currentDialog?.type === 'single_signature_reapproval' && (
        <SingleSignatureReapprovalDialog />
      )}
      {/* Lift NotifiContextProvider to minimize notification card render delays, but avoid wrapping it in _app to prevent hiding the entire app while NotifiContextProvider initializes. */}
      {/* Also isolate errors here so they don't take down the whole app. */}
      <ErrorBoundary>
        <NotifiContextProviderWrapper>
          {currentDialog?.type === 'notifi_settings' && <NotifiDialog />}
        </NotifiContextProviderWrapper>
      </ErrorBoundary>
      {currentDialog?.type === 'edit_user_profile' && (
        <EditSubaccountProfileDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'settings' && <SettingsDialog />}
      {currentDialog?.type === 'help_center' && <HelpCenterDialog />}
      {currentDialog?.type === 'export_history' && (
        <ExportHistoryDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'generate_desktop_wallet_link_qr_code' && (
        <GenerateDesktopWalletLinkQRCodeDialog />
      )}
    </>
  );
}
