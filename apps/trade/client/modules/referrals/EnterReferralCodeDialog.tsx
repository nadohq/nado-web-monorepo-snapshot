import { CompactInput, PrimaryButton } from '@nadohq/web-ui';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { Form } from 'client/components/Form';
import {
  RUN_WITH_DELAY_DURATIONS,
  useRunWithDelayOnCondition,
} from 'client/hooks/util/useRunWithDelayOnCondition';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import {
  ConfirmReferralActionButtonState,
  useConfirmReferral,
} from 'client/modules/referrals/hooks/useConfirmReferral';
import { useTranslation } from 'react-i18next';

export function EnterReferralCodeDialog() {
  const { t } = useTranslation();
  const { hide } = useDialog();
  const { onSubmit, referralCodeInput, setReferralCodeInput, buttonState } =
    useConfirmReferral();

  useRunWithDelayOnCondition({
    condition: buttonState === 'success',
    fn: hide,
    delay: RUN_WITH_DELAY_DURATIONS.SHORT,
  });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.enterReferralCode)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body asChild>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <p>{t(($) => $.referrals.enterReferralCodeDescription)}</p>
          <CompactInput
            type="text"
            placeholder={t(($) => $.inputPlaceholders.referralCode)}
            value={referralCodeInput}
            onChange={(e) => setReferralCodeInput(e.target.value)}
          />
          <ConfirmReferralButton buttonState={buttonState} />
        </Form>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}

function ConfirmReferralButton({
  buttonState,
}: {
  buttonState: ConfirmReferralActionButtonState;
}) {
  const { t } = useTranslation();

  const content = (() => {
    switch (buttonState) {
      case 'idle':
        return t(($) => $.buttons.confirm);
      case 'loading':
        return t(($) => $.buttons.confirmingReferral);
      case 'disabled':
        return t(($) => $.buttons.enterReferralCode);
      case 'success':
        return (
          <ButtonStateContent.Success
            message={t(($) => $.buttons.referralConfirmed)}
          />
        );
    }
  })();

  return (
    <PrimaryButton
      type="submit"
      disabled={buttonState === 'disabled'}
      isLoading={buttonState === 'loading'}
    >
      {content}
    </PrimaryButton>
  );
}
