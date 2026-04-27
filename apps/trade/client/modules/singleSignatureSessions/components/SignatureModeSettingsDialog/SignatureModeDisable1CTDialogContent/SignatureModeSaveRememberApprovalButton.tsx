import { PrimaryButton } from '@nadohq/web-ui';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useTranslation } from 'react-i18next';

interface Props {
  buttonState: BaseActionButtonState;
  onSubmit(): void;
}

export function SignatureModeSaveRememberApprovalButton({
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
      default:
        return t(($) => $.buttons.saveChanges);
    }
  })();

  return (
    <PrimaryButton
      onClick={onSubmit}
      isLoading={buttonState === 'loading'}
      disabled={buttonState !== 'idle'}
    >
      {buttonContent}
    </PrimaryButton>
  );
}
