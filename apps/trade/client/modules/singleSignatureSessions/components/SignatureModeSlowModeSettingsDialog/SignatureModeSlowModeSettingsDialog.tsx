import {
  SEQUENCER_FEE_AMOUNT_USDT,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { Divider } from '@nadohq/web-ui';
import { ErrorPanel } from 'client/components/ErrorPanel';
import { Form } from 'client/components/Form';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useSignatureModeSlowModeSettingsDialog } from 'client/modules/singleSignatureSessions/components/SignatureModeSlowModeSettingsDialog/hooks/useSignatureModeSlowModeSettingsDialog';
import { useSlowModeSettingsPrivateKeyErrorTooltipContent } from 'client/modules/singleSignatureSessions/components/SignatureModeSlowModeSettingsDialog/hooks/useSlowModeSettingsPrivateKeyErrorTooltipContent';
import { PrivateKeyInput } from 'client/modules/singleSignatureSessions/components/SignatureModeSlowModeSettingsDialog/PrivateKeyInput';
import { SlowModeEnable1CTSwitch } from 'client/modules/singleSignatureSessions/components/SignatureModeSlowModeSettingsDialog/SlowModeEnable1CTSwitch';
import { SlowModeSettingsActionButton } from 'client/modules/singleSignatureSessions/components/SignatureModeSlowModeSettingsDialog/SlowModeSettingsActionButton';
import { SlowModeSettingsInfoCollapsible } from 'client/modules/singleSignatureSessions/components/SignatureModeSlowModeSettingsDialog/SlowModeSettingsInfoCollapsible';
import { useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

export function SignatureModeSlowModeSettingsDialog() {
  const { t } = useTranslation();
  const { hide } = useDialog();
  const {
    primaryQuoteToken: { symbol: primaryQuoteTokenSymbol },
  } = useNadoMetadataContext();
  const {
    form,
    formError,
    privateKeyInputError,
    validatePrivateKey,
    setRandomPrivateKey,
    buttonState,
    userAction,
    onEnableSingleSignatureChange,
    onSubmit,
  } = useSignatureModeSlowModeSettingsDialog();

  const privateKeyErrorTooltipContent =
    useSlowModeSettingsPrivateKeyErrorTooltipContent({
      error: privateKeyInputError,
    });

  const selectedMode = useWatch({
    control: form.control,
    name: 'selectedMode',
  });
  const isSingleSignatureEnabled = selectedMode === 'sign_once';
  const disablePrivateKeyInput = !isSingleSignatureEnabled;
  const hasInsufficientBalanceForFee =
    formError === 'insufficient_balance_for_fee';

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.advanced1CT)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body asChild>
        <Form onSubmit={onSubmit}>
          <SlowModeSettingsInfoCollapsible />
          <Divider />
          <SlowModeEnable1CTSwitch
            checked={isSingleSignatureEnabled}
            onCheckedChange={onEnableSingleSignatureChange}
          />
          <PrivateKeyInput
            form={form}
            error={privateKeyErrorTooltipContent}
            setRandomPrivateKey={setRandomPrivateKey}
            validatePrivateKey={validatePrivateKey}
            disabled={disablePrivateKeyInput}
          />
          {/*Show clear warning to user when they don't have enough balance for the fee*/}
          {hasInsufficientBalanceForFee && (
            <ErrorPanel>
              <Trans
                i18nKey={($) =>
                  $.errors.insufficientBalanceForOneClickTradingFee
                }
                values={{
                  primaryQuoteTokenSymbol,
                  feeAmount: SEQUENCER_FEE_AMOUNT_USDT,
                }}
              />
            </ErrorPanel>
          )}
          <SlowModeSettingsActionButton
            userAction={userAction}
            buttonState={buttonState}
          />
        </Form>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
