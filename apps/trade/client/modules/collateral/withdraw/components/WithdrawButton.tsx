import { WithClassnames } from '@nadohq/web-common';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { HANDLED_BUTTON_USER_STATE_ERRORS } from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { ValidUserStatePrimaryButton } from 'client/components/ValidUserStatePrimaryButton/ValidUserStatePrimaryButton';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface WithdrawSubmitButtonProps {
  state: BaseActionButtonState;
  enableBorrows: boolean;
}

export function WithdrawButton({
  state,
  enableBorrows,
  className,
}: WithClassnames<WithdrawSubmitButtonProps>) {
  const { t } = useTranslation();

  const message = useMemo(() => {
    switch (state) {
      case 'disabled':
        return t(($) => $.buttons.enterAmount);
      case 'success':
        return (
          <ButtonStateContent.Success
            message={
              enableBorrows
                ? t(($) => $.buttons.borrowSubmitted)
                : t(($) => $.buttons.withdrawalSuccessful)
            }
          />
        );
      case 'loading':
        return (
          <ButtonStateContent.Loading
            singleSignatureMessage={
              enableBorrows
                ? t(($) => $.buttons.submittingBorrow)
                : t(($) => $.buttons.submittingWithdrawal)
            }
          />
        );
      case 'idle':
        return enableBorrows
          ? t(($) => $.buttons.borrowAndWithdraw)
          : t(($) => $.buttons.withdraw);
    }
  }, [t, state, enableBorrows]);

  return (
    <ValidUserStatePrimaryButton
      className={className}
      type="submit"
      isLoading={state === 'loading'}
      disabled={state === 'disabled'}
      handledErrors={
        HANDLED_BUTTON_USER_STATE_ERRORS.onlyIncorrectConnectedChain
      }
      dataTestId="withdraw-submit-button"
    >
      {message}
    </ValidUserStatePrimaryButton>
  );
}
