import { WithClassnames } from '@nadohq/web-common';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { HANDLED_BUTTON_USER_STATE_ERRORS } from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { ValidUserStatePrimaryButton } from 'client/components/ValidUserStatePrimaryButton/ValidUserStatePrimaryButton';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface SubaccountQuoteTransferSubmitButtonProps extends WithClassnames {
  state: BaseActionButtonState;
}

export function SubaccountQuoteTransferSubmitButton({
  state,
  className,
}: SubaccountQuoteTransferSubmitButtonProps) {
  const { t } = useTranslation();

  const message = useMemo(() => {
    switch (state) {
      case 'disabled':
        return t(($) => $.buttons.enterAmount);
      case 'loading':
        return t(($) => $.buttons.confirmTransfer);
      case 'success':
        return (
          <ButtonStateContent.Success
            message={t(($) => $.buttons.transferSuccessful)}
          />
        );
      case 'idle':
        return t(($) => $.buttons.transferFunds);
    }
  }, [t, state]);

  return (
    <ValidUserStatePrimaryButton
      className={className}
      type="submit"
      disabled={state === 'disabled'}
      isLoading={state === 'loading'}
      handledErrors={
        HANDLED_BUTTON_USER_STATE_ERRORS.onlyIncorrectConnectedChain
      }
    >
      {message}
    </ValidUserStatePrimaryButton>
  );
}
