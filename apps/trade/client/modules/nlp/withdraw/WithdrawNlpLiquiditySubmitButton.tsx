import { WithClassnames } from '@nadohq/web-common';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { HANDLED_BUTTON_USER_STATE_ERRORS } from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { ValidUserStatePrimaryButton } from 'client/components/ValidUserStatePrimaryButton/ValidUserStatePrimaryButton';
import { WithdrawNlpLiquidityActionButtonState } from 'client/modules/nlp/withdraw/hooks/useWithdrawNlpLiquidityDialog';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  state: WithdrawNlpLiquidityActionButtonState;
}

export function WithdrawNlpLiquiditySubmitButton({ className, state }: Props) {
  const { t } = useTranslation();

  const labelContent = (() => {
    if (state === 'disabled') {
      return t(($) => $.buttons.enterAmount);
    }
    if (state === 'success') {
      return (
        <ButtonStateContent.Success
          message={t(($) => $.buttons.liquidityWithdrawn)}
        />
      );
    }
    if (state === 'loading') {
      return (
        <ButtonStateContent.Loading
          singleSignatureMessage={t(($) => $.buttons.withdrawingLiquidity)}
        />
      );
    }
    return t(($) => $.buttons.withdrawLiquidity);
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
    >
      {labelContent}
    </ValidUserStatePrimaryButton>
  );
}
