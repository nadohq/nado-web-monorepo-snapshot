import { WithClassnames } from '@nadohq/web-common';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { HANDLED_BUTTON_USER_STATE_ERRORS } from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { ValidUserStatePrimaryButton } from 'client/components/ValidUserStatePrimaryButton/ValidUserStatePrimaryButton';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  state: BaseActionButtonState;
}

export function AddTpSlDialogSubmitButton({
  state,
  className,
}: WithClassnames<Props>) {
  const { t } = useTranslation();

  const message = useMemo(() => {
    switch (state) {
      case 'disabled':
        return t(($) => $.buttons.placeTpSl);
      case 'loading':
        return (
          <ButtonStateContent.Loading
            singleSignatureMessage={t(($) => $.buttons.submittingTpSl)}
          />
        );
      case 'success':
        return (
          <ButtonStateContent.Success
            message={t(($) => $.buttons.tpSlPlaced)}
          />
        );
      case 'idle':
        return t(($) => $.buttons.placeTpSl);
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
      dataTestId="add-tpsl-dialog-submit-button"
    >
      {message}
    </ValidUserStatePrimaryButton>
  );
}
