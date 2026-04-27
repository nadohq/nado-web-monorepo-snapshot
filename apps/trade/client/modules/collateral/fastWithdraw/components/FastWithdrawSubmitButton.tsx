import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { HANDLED_BUTTON_USER_STATE_ERRORS } from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { ValidUserStatePrimaryButton } from 'client/components/ValidUserStatePrimaryButton/ValidUserStatePrimaryButton';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface FastWithdrawSubmitButtonProps {
  state: BaseActionButtonState;
  onSubmit: () => void;
}

export function FastWithdrawSubmitButton({
  state,
  onSubmit,
}: FastWithdrawSubmitButtonProps) {
  const { t } = useTranslation();

  const message = useMemo(() => {
    switch (state) {
      case 'disabled':
        return t(($) => $.buttons.fastWithdraw);
      case 'success':
        return (
          <ButtonStateContent.Success
            message={t(($) => $.buttons.withdrawalSuccessful)}
          />
        );
      case 'loading':
        return t(($) => $.buttons.submittingWithdrawal);
      case 'idle':
        return t(($) => $.buttons.fastWithdraw);
    }
  }, [t, state]);

  return (
    <ValidUserStatePrimaryButton
      type="submit"
      onClick={onSubmit}
      isLoading={state === 'loading'}
      disabled={state === 'disabled'}
      handledErrors={
        HANDLED_BUTTON_USER_STATE_ERRORS.onlyIncorrectConnectedChain
      }
    >
      {message}
    </ValidUserStatePrimaryButton>
  );
}
