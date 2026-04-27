import { WithClassnames } from '@nadohq/web-common';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { HANDLED_BUTTON_USER_STATE_ERRORS } from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { ValidUserStatePrimaryButton } from 'client/components/ValidUserStatePrimaryButton/ValidUserStatePrimaryButton';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface RepayConvertButtonProps {
  state: BaseActionButtonState;
}

export const RepayConvertButton = ({
  state,
  className,
}: WithClassnames<RepayConvertButtonProps>) => {
  const { t } = useTranslation();

  const message = useMemo(() => {
    switch (state) {
      case 'disabled':
        return t(($) => $.buttons.enterAmount);
      case 'loading':
        return (
          <ButtonStateContent.Loading
            singleSignatureMessage={t(($) => $.buttons.placingOrder)}
          />
        );
      case 'success':
        return (
          <ButtonStateContent.Success
            message={t(($) => $.buttons.repaymentMade)}
          />
        );
      case 'idle':
        return t(($) => $.buttons.repayWithMarketOrder);
    }
  }, [t, state]);

  return (
    <ValidUserStatePrimaryButton
      className={className}
      type="submit"
      isLoading={state === 'loading'}
      disabled={state === 'disabled'}
      handledErrors={
        HANDLED_BUTTON_USER_STATE_ERRORS.onlyIncorrectConnectedChain
      }
    >
      {message}
    </ValidUserStatePrimaryButton>
  );
};
