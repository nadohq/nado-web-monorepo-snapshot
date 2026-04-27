import { PrimaryButton } from '@nadohq/web-ui';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  buttonState: BaseActionButtonState;
  onSubmit(): void;
}

export function SignatureModeEnable1CTCreateKeyButton({
  buttonState,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  const buttonContent = useMemo(() => {
    switch (buttonState) {
      case 'loading':
        return (
          <ButtonStateContent.Loading
            singleSignatureMessage={t(($) => $.buttons.saving)}
          />
        );
      case 'success':
        return (
          <ButtonStateContent.Success
            message={t(($) => $.buttons.keyCreated)}
          />
        );
      default:
        return t(($) => $.buttons.createKey);
    }
  }, [buttonState, t]);

  return (
    <PrimaryButton
      onClick={onSubmit}
      isLoading={buttonState === 'loading'}
      disabled={buttonState !== 'idle'}
      data-testid="signature-mode-create-key-button"
    >
      {buttonContent}
    </PrimaryButton>
  );
}
