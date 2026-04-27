import { WithClassnames } from '@nadohq/web-common';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { HANDLED_BUTTON_USER_STATE_ERRORS } from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { ValidUserStatePrimaryButton } from 'client/components/ValidUserStatePrimaryButton/ValidUserStatePrimaryButton';
import { DepositNlpLiquidityActionButtonState } from 'client/modules/nlp/deposit/hooks/useDepositNlpLiquidityDialog';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  state: DepositNlpLiquidityActionButtonState;
}

export function DepositNlpLiquiditySubmitButton({ className, state }: Props) {
  const { t } = useTranslation();

  const labelContent = (() => {
    if (state === 'disabled') {
      return t(($) => $.buttons.enterAmount);
    }
    if (state === 'success') {
      return (
        <ButtonStateContent.Success
          message={t(($) => $.buttons.liquidityDeposited)}
        />
      );
    }
    if (state === 'loading') {
      return (
        <ButtonStateContent.Loading
          singleSignatureMessage={t(($) => $.buttons.depositingLiquidity)}
        />
      );
    }
    return t(($) => $.buttons.depositLiquidity);
  })();

  return (
    <ValidUserStatePrimaryButton
      type="submit"
      className={className}
      isLoading={state === 'loading'}
      disabled={state === 'disabled'}
      handledErrors={
        HANDLED_BUTTON_USER_STATE_ERRORS.onlyIncorrectConnectedChain
      }
      dataTestId="nlp-deposit-dialog-submit-button"
    >
      {labelContent}
    </ValidUserStatePrimaryButton>
  );
}
