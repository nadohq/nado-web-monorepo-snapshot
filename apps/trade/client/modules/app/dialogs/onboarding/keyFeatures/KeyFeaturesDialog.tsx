import { PrimaryButton } from '@nadohq/web-ui';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { KeyFeatures } from 'client/modules/app/dialogs/onboarding/keyFeatures/KeyFeatures';
import { useTranslation } from 'react-i18next';

export function KeyFeaturesDialog() {
  const { t } = useTranslation();
  const { hide } = useDialog();

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.keyFeaturesWelcome)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <KeyFeatures />
        <PrimaryButton
          onClick={hide}
          dataTestId="key-features-dialog-start-trading-button"
        >
          {t(($) => $.buttons.startTrading)}
        </PrimaryButton>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
