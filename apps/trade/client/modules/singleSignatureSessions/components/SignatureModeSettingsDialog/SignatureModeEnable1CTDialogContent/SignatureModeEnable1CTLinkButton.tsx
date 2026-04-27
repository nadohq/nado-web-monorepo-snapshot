import { PrimaryButton } from '@nadohq/web-ui';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  buttonState: BaseActionButtonState;
  onSubmit(): void;
}

export function SignatureModeEnable1CTLinkButton({
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
            message={t(($) => $.buttons.changesApplied)}
          />
        );
      default:
        return t(($) => $.buttons.enableOneClickTrading);
    }
  }, [buttonState, t]);

  return (
    <PrimaryButton
      onClick={onSubmit}
      isLoading={buttonState === 'loading'}
      disabled={buttonState !== 'idle' && buttonState !== 'success'}
      data-testid="signature-mode-enable-1ct-submit-button"
    >
      {buttonContent}
    </PrimaryButton>
  );
}
