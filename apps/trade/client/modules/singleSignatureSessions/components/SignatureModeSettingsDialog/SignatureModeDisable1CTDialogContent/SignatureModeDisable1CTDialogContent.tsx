import { PrimaryButton } from '@nadohq/web-ui';
import {
  HANDLED_BUTTON_USER_STATE_ERRORS,
  useButtonUserStateErrorProps,
} from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { RememberApprovalSwitch } from 'client/modules/singleSignatureSessions/components/RememberApprovalSwitch';
import { SignatureModeDisable1CTSubmitButton } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeDisable1CTDialogContent/SignatureModeDisable1CTSubmitButton';
import { SignatureModeNumSwitchesRemaining } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeDisable1CTDialogContent/SignatureModeNumSwitchesRemaining';
import { SignatureModeSaveRememberApprovalButton } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeDisable1CTDialogContent/SignatureModeSaveRememberApprovalButton';
import { SignatureModeUserStateWarning } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeDisable1CTDialogContent/SignatureModeUserWarning';
import { useSignatureModeDisable1CTDialogContent } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeDisable1CTDialogContent/useSignatureModeDisable1CTDialogContent';
import { useSignatureModeSavePrivateKey } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeDisable1CTDialogContent/useSignatureModeSavePrivateKey';
import { SignatureModeInfo } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeInfo';

interface Props {
  isSmartContractWalletConnected: boolean | undefined;

  onDisableSuccess(): void;
}

export function SignatureModeDisable1CTDialogContent({
  onDisableSuccess,
  isSmartContractWalletConnected,
}: Props) {
  const {
    buttonState: disable1CTButtonState,
    userStateWarning,
    numSwitchesRemaining,
    totalTxLimit,
    onSubmit: onSubmitDisable1CT,
  } = useSignatureModeDisable1CTDialogContent({
    onDisableSuccess,
  });

  const {
    buttonState: rememberApprovalButtonState,
    showSaveRememberApprovalButton,
    onSubmit: onSubmitSavePrivateKey,
    savePrivateKey,
    setSavePrivateKey,
  } = useSignatureModeSavePrivateKey();

  const userStateErrorButtonProps = useButtonUserStateErrorProps({
    handledErrors: HANDLED_BUTTON_USER_STATE_ERRORS.onlyIncorrectConnectedChain,
  });

  const actionContent = (() => {
    if (userStateErrorButtonProps) {
      return <PrimaryButton {...userStateErrorButtonProps} />;
    }

    return (
      <div className="flex flex-col gap-y-3">
        <RememberApprovalSwitch
          disabled={rememberApprovalButtonState === 'loading'}
          checked={savePrivateKey}
          onCheckedChange={setSavePrivateKey}
        />
        {showSaveRememberApprovalButton && (
          <SignatureModeSaveRememberApprovalButton
            buttonState={rememberApprovalButtonState}
            onSubmit={onSubmitSavePrivateKey}
          />
        )}
        <SignatureModeDisable1CTSubmitButton
          buttonState={disable1CTButtonState}
          onSubmit={onSubmitDisable1CT}
        />
        <SignatureModeNumSwitchesRemaining
          numSwitchesRemaining={numSwitchesRemaining}
          totalTxLimit={totalTxLimit}
        />
      </div>
    );
  })();

  return (
    <>
      <SignatureModeInfo
        isSmartContractWalletConnected={isSmartContractWalletConnected}
      />
      {/*Only show the setup content if the user is using a normal wallet, otherwise, divert their attention to the slow mode settings in SignatureModeInfo*/}
      {!isSmartContractWalletConnected && (
        <>
          <SignatureModeUserStateWarning userStateWarning={userStateWarning} />
          {actionContent}
        </>
      )}
    </>
  );
}
