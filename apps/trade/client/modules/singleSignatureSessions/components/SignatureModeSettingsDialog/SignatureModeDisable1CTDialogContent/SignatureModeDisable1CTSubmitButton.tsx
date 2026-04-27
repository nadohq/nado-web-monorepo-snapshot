import { SecondaryButton } from '@nadohq/web-ui';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useTranslation } from 'react-i18next';

interface Props {
  buttonState: BaseActionButtonState;
  onSubmit(): void;
}

export function SignatureModeDisable1CTSubmitButton({
  buttonState,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  const buttonContent = (() => {
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
        return t(($) => $.disableOneClickTrading);
    }
  })();

  return (
    <SecondaryButton
      onClick={onSubmit}
      isLoading={buttonState === 'loading'}
      disabled={buttonState !== 'success' && buttonState !== 'idle'}
    >
      {buttonContent}
    </SecondaryButton>
  );
}
