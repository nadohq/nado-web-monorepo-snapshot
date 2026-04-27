import { WithClassnames } from '@nadohq/web-common';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { HANDLED_BUTTON_USER_STATE_ERRORS } from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { ValidUserStatePrimaryButton } from 'client/components/ValidUserStatePrimaryButton/ValidUserStatePrimaryButton';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  state: BaseActionButtonState;
  isAddMargin: boolean;
}

export function IsolatedAdjustMarginSubmitButton({
  state,
  isAddMargin,
  className,
}: WithClassnames<Props>) {
  const { t } = useTranslation();

  const message = useMemo(() => {
    switch (state) {
      case 'disabled':
        return t(($) => $.buttons.enterAmount);
      case 'loading':
        return (
          <ButtonStateContent.Loading
            singleSignatureMessage={
              isAddMargin
                ? t(($) => $.buttons.addingMargin)
                : t(($) => $.buttons.removingMargin)
            }
          />
        );
      case 'success':
        return (
          <ButtonStateContent.Success
            message={
              isAddMargin
                ? t(($) => $.buttons.marginAdded)
                : t(($) => $.buttons.marginRemoved)
            }
          />
        );
      case 'idle':
        return isAddMargin
          ? t(($) => $.buttons.addMargin)
          : t(($) => $.buttons.removeMargin);
    }
  }, [t, state, isAddMargin]);

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
}
