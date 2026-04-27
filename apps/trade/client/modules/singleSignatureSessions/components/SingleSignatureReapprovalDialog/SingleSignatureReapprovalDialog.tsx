import { Icons, PrimaryButton } from '@nadohq/web-ui';
import {
  HANDLED_BUTTON_USER_STATE_ERRORS,
  useButtonUserStateErrorProps,
} from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { useIsSmartContractWalletConnected } from 'client/hooks/util/useIsSmartContractWalletConnected';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { RememberApprovalSwitch } from 'client/modules/singleSignatureSessions/components/RememberApprovalSwitch';
import { SignatureModeSlowModeEntrypoint } from 'client/modules/singleSignatureSessions/components/SignatureModeSlowModeEntrypoint';
import { SingleSignatureReapprovalSubmitButton } from 'client/modules/singleSignatureSessions/components/SingleSignatureReapprovalDialog/SingleSignatureReapprovalSubmitButton';
import { useSingleSignatureReapprovalDialog } from 'client/modules/singleSignatureSessions/components/SingleSignatureReapprovalDialog/useSingleSignatureReapprovalDialog';
import { useTranslation } from 'react-i18next';

export function SingleSignatureReapprovalDialog() {
  const { t } = useTranslation();
  const { hide } = useDialog();
  const { savePrivateKey, setSavePrivateKey, buttonState, onSubmit } =
    useSingleSignatureReapprovalDialog();
  const isSmartContractWalletConnected = useIsSmartContractWalletConnected();

  const userStateErrorButtonProps = useButtonUserStateErrorProps({
    handledErrors: HANDLED_BUTTON_USER_STATE_ERRORS.onlyIncorrectConnectedChain,
  });

  const actionContent = (() => {
    if (isSmartContractWalletConnected) {
      // Hide the actions to divert their attention to SignatureModeSlowModeEntrypoint
      return null;
    }
    if (userStateErrorButtonProps) {
      return <PrimaryButton {...userStateErrorButtonProps} />;
    }

    return (
      <div className="flex flex-col gap-y-2">
        <RememberApprovalSwitch
          disabled={buttonState === 'loading'}
          checked={savePrivateKey}
          onCheckedChange={setSavePrivateKey}
        />
        <SingleSignatureReapprovalSubmitButton
          onSubmit={onSubmit}
          buttonState={buttonState}
        />
      </div>
    );
  })();

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.approveOneClickTrading)}
        <Icons.LightningFill size={20} className="text-accent" />
      </BaseAppDialog.Title>
      <BaseAppDialog.Body className="text-text-tertiary">
        <div className="flex flex-col gap-y-2">
          <p>{t(($) => $.oneClickTradingBenefits)}</p>
          <p>{t(($) => $.changeOneClickTradingPreferencesInSettings)}</p>
          <SignatureModeSlowModeEntrypoint
            isSmartContractWalletConnected={isSmartContractWalletConnected}
          />
        </div>
        {actionContent}
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
