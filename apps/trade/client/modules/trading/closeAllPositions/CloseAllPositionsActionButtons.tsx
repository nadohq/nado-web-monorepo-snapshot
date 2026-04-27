import { PrimaryButton, SecondaryButton, TextButton } from '@nadohq/web-ui';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import {
  HANDLED_BUTTON_USER_STATE_ERRORS,
  useButtonUserStateErrorProps,
} from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  hide: () => void;
  closeAllPositions: () => void;
  buttonState: BaseActionButtonState;
}

export function CloseAllPositionsActionButtons({
  hide,
  closeAllPositions,
  buttonState,
}: Props) {
  const { t } = useTranslation();

  const userStateErrorButtonProps = useButtonUserStateErrorProps({
    handledErrors: HANDLED_BUTTON_USER_STATE_ERRORS.onlyIncorrectConnectedChain,
  });

  const message = useMemo(() => {
    switch (buttonState) {
      case 'loading':
        return (
          <ButtonStateContent.Loading
            singleSignatureMessage={t(($) => $.closingAllPositions)}
          />
        );
      case 'success':
        return (
          <ButtonStateContent.Success
            message={t(($) => $.buttons.orderSubmitted)}
          />
        );
      default:
        return t(($) => $.closeAll);
    }
  }, [buttonState, t]);

  const actionButton = (() => {
    if (userStateErrorButtonProps) {
      return <PrimaryButton {...userStateErrorButtonProps} />;
    }

    return (
      <SecondaryButton
        dataTestId="close-all-positions-action-button"
        destructive
        isLoading={buttonState === 'loading'}
        onClick={closeAllPositions}
      >
        {message}
      </SecondaryButton>
    );
  })();

  return (
    <div className="flex flex-col gap-y-3">
      {actionButton}
      <TextButton
        colorVariant="secondary"
        onClick={hide}
        dataTestId="close-all-positions-cancel-button"
      >
        {t(($) => $.buttons.cancel)}
      </TextButton>
    </div>
  );
}
