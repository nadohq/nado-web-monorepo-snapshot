import { useEVMContext } from '@nadohq/react-client';
import { CompactInput, PrimaryButton } from '@nadohq/web-ui';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { Form } from 'client/components/Form';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import {
  ConfirmReferralActionButtonState,
  useConfirmReferral,
} from 'client/modules/app/gatedAppAccess/gatedBeta/BetaWelcomeScreen/useConfirmReferral';
import { useTranslation } from 'react-i18next';

export function BetaActionContent() {
  const { t } = useTranslation();
  const { show } = useDialog();
  const { connectionStatus } = useEVMContext();
  const isConnected = connectionStatus.type === 'connected';

  if (!isConnected) {
    return (
      <PrimaryButton
        onClick={() =>
          show({
            type: 'connect',
            params: {},
          })
        }
      >
        {t(($) => $.buttons.connectWallet)}
      </PrimaryButton>
    );
  }

  return <ConfirmReferralContent />;
}

function ConfirmReferralContent() {
  const { t } = useTranslation();
  const { onSubmit, referralCodeInput, setReferralCodeInput, buttonState } =
    useConfirmReferral();

  return (
    <Form
      className="font-brand flex flex-col gap-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <CompactInput
        type="text"
        placeholder={t(($) => $.inputPlaceholders.referralCode)}
        inputContainerClassName="h-12 w-90 bg-surface-3"
        value={referralCodeInput}
        onChange={(e) => setReferralCodeInput(e.target.value)}
      />
      <ConfirmReferralButton buttonState={buttonState} />
    </Form>
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
        return t(($) => $.buttons.confirmReferral);
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
      case 'code_taken':
        return t(($) => $.errors.noInvitesRemaining);
    }
  })();

  return (
    <PrimaryButton
      size="xl"
      type="submit"
      disabled={buttonState === 'disabled' || buttonState === 'code_taken'}
      isLoading={buttonState === 'loading'}
    >
      {content}
    </PrimaryButton>
  );
}
