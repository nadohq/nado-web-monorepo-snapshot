import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { HANDLED_BUTTON_USER_STATE_ERRORS } from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { ValidUserStatePrimaryButton } from 'client/components/ValidUserStatePrimaryButton/ValidUserStatePrimaryButton';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  state: BaseActionButtonState;
  isLimitOrder: boolean;
  isClosingFullPosition: boolean;
}

export function ClosePositionButton({
  state,
  isLimitOrder,
  isClosingFullPosition,
}: Props) {
  const { t } = useTranslation();

  const message = useMemo(() => {
    const priceType = isLimitOrder ? t(($) => $.limit) : t(($) => $.market);
    const actionLabel = isClosingFullPosition
      ? t(($) => $.closePriceType, { priceType })
      : t(($) => $.reducePriceType, { priceType });

    switch (state) {
      case 'disabled':
        return t(($) => $.buttons.closePosition);
      case 'loading':
        return (
          <ButtonStateContent.Loading
            singleSignatureMessage={t(($) => $.buttons.placingOrder)}
          />
        );
      case 'success':
        return (
          <ButtonStateContent.Success
            message={t(($) => $.buttons.actionSubmitted, {
              action: actionLabel,
            })}
          />
        );
      case 'idle':
        return actionLabel;
    }
  }, [t, state, isLimitOrder, isClosingFullPosition]);

  return (
    <ValidUserStatePrimaryButton
      type="submit"
      isLoading={state === 'loading'}
      disabled={state === 'disabled'}
      handledErrors={
        HANDLED_BUTTON_USER_STATE_ERRORS.onlyIncorrectConnectedChain
      }
      dataTestId="close-position-dialog-close-button"
    >
      {message}
    </ValidUserStatePrimaryButton>
  );
}
