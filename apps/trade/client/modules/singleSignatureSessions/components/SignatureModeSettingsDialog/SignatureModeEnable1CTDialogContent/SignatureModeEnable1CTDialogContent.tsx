import { PrimaryButton, TextButton } from '@nadohq/web-ui';
import {
  HANDLED_BUTTON_USER_STATE_ERRORS,
  useButtonUserStateErrorProps,
} from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { RememberApprovalSwitch } from 'client/modules/singleSignatureSessions/components/RememberApprovalSwitch';
import { SignatureModeEnable1CTCreateKeyButton } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeEnable1CTDialogContent/SignatureModeEnable1CTCreateKeyButton';
import { SignatureModeEnable1CTLinkButton } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeEnable1CTDialogContent/SignatureModeEnable1CTLinkButton';
import { SignatureModeUserStateErrorCard } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeEnable1CTDialogContent/SignatureModeUserStateErrorCard';
import { useSignatureModeEnable1CTDialogContent } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeEnable1CTDialogContent/useSignatureModeEnable1CTDialogContent';
import { SignatureModeInfo } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeInfo';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  isSmartContractWalletConnected: boolean | undefined;

  onEnableSuccess(): void;
}

export function SignatureModeEnable1CTDialogContent({
  onEnableSuccess,
  isSmartContractWalletConnected,
}: Props) {
  const { t } = useTranslation();
  const {
    createKeyButtonState,
    linkButtonState,
    userStateError,
    onSubmitCreateKey,
    onSubmitLink,
    disableInputs,
    savePrivateKey,
    setSavePrivateKey,
    requiresSingleSignatureSetup,
    skipSignOnceSuggestion,
  } = useSignatureModeEnable1CTDialogContent({
    onEnableSuccess,
  });

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
          disabled={disableInputs}
          checked={savePrivateKey}
          onCheckedChange={setSavePrivateKey}
        />
        <ActionStep
          label={t(($) => $.singleSignatureSession.step1CreateSigningKey)}
          content={
            <SignatureModeEnable1CTCreateKeyButton
              buttonState={createKeyButtonState}
              onSubmit={onSubmitCreateKey}
            />
          }
        />
        <ActionStep
          label={t(($) => $.singleSignatureSession.step2ApproveTransaction)}
          content={
            <SignatureModeEnable1CTLinkButton
              buttonState={linkButtonState}
              onSubmit={onSubmitLink}
            />
          }
        />
        {requiresSingleSignatureSetup && (
          <TextButton
            className="text-center"
            colorVariant="tertiary"
            onClick={skipSignOnceSuggestion}
          >
            <DefinitionTooltip
              definitionId="octSignEveryTransaction"
              decoration={{ icon: true }}
              noHelpCursor
            >
              {t(($) => $.buttons.signEveryTransactionInstead)}
            </DefinitionTooltip>
          </TextButton>
        )}
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
          <SignatureModeUserStateErrorCard userStateError={userStateError} />
          {actionContent}
        </>
      )}
    </>
  );
}

interface ActionStepProps {
  label: ReactNode;
  content: ReactNode;
}

function ActionStep({ label, content }: ActionStepProps) {
  return (
    <div className="flex flex-col gap-y-1.5">
      <p className="text-text-tertiary text-xs">{label}</p>
      {content}
    </div>
  );
}
