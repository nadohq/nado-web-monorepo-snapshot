import { ButtonHelperInfo } from '@nadohq/web-ui';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { HANDLED_BUTTON_USER_STATE_ERRORS } from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { ValidUserStatePrimaryButton } from 'client/components/ValidUserStatePrimaryButton/ValidUserStatePrimaryButton';
import {
  SignatureModeSlowModeSettingsAction,
  SignatureModeSlowModeSettingsActionButtonState,
} from 'client/modules/singleSignatureSessions/components/SignatureModeSlowModeSettingsDialog/hooks/types';
import { useTranslation } from 'react-i18next';

interface Props {
  buttonState: SignatureModeSlowModeSettingsActionButtonState;
  userAction: SignatureModeSlowModeSettingsAction | undefined;
}

export function SlowModeSettingsActionButton({
  buttonState,
  userAction,
}: Props) {
  const { t } = useTranslation();

  const buttonContent = (() => {
    switch (buttonState) {
      case 'success':
        return (
          <ButtonStateContent.Success
            message={t(($) => $.buttons.tradingModeSaved)}
          />
        );
      case 'approve_success':
        return (
          <ButtonStateContent.Success
            message={t(($) => $.buttons.feeApproved)}
          />
        );
      case 'idle':
        switch (userAction) {
          case 'requires_fee_approval':
            return t(($) => $.buttons.approveFee);
          case 'execute_slow_mode':
            return t(($) => $.buttons.saveAndSendTransaction);
          case 'save_without_tx':
            return t(($) => $.buttons.save);
          case undefined:
            // This shouldn't ever be the case
            return '';
        }
      case 'loading':
        if (userAction === 'save_without_tx') {
          return t(($) => $.buttons.saving);
        }
        return t(($) => $.buttons.confirmTransaction);
      case 'disabled':
        return t(($) => $.buttons.save);
    }
  })();

  return (
    <ButtonHelperInfo.Container>
      <ValidUserStatePrimaryButton
        type="submit"
        isLoading={buttonState === 'loading'}
        disabled={buttonState === 'disabled'}
        handledErrors={
          HANDLED_BUTTON_USER_STATE_ERRORS.onlyIncorrectConnectedChain
        }
      >
        {buttonContent}
      </ValidUserStatePrimaryButton>
      {buttonState === 'success' && (
        <ButtonHelperInfo.Content>
          {t(($) => $.oneClickTradingEnabledDelayWarning)}
        </ButtonHelperInfo.Content>
      )}
    </ButtonHelperInfo.Container>
  );
}
