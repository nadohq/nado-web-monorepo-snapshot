import { PrimaryButton } from '@nadohq/web-ui';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useTranslation } from 'react-i18next';

interface Props {
  buttonState: BaseActionButtonState;

  onSubmit(): void;
}

export function SingleSignatureReapprovalSubmitButton({
  buttonState,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  const buttonContent = (() => {
    switch (buttonState) {
      case 'loading':
        return (
          <ButtonStateContent.Loading
            singleSignatureMessage={t(($) => $.buttons.approving)}
          />
        );
      case 'success':
        return (
          <ButtonStateContent.Success
            message={t(($) => $.buttons.changesApplied)}
          />
        );
      default:
        return t(($) => $.buttons.approveOneClickTrading);
    }
  })();

  return (
    <PrimaryButton
      onClick={onSubmit}
      disabled={buttonState !== 'idle' && buttonState !== 'success'}
      isLoading={buttonState === 'loading'}
      dataTestId="single-signature-reapproval-submit-button"
    >
      {buttonContent}
    </PrimaryButton>
  );
}
