import { WithClassnames } from '@nadohq/web-common';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { HANDLED_BUTTON_USER_STATE_ERRORS } from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { ValidUserStatePrimaryButton } from 'client/components/ValidUserStatePrimaryButton/ValidUserStatePrimaryButton';
import { DepositActionButtonState } from 'client/modules/collateral/deposit/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface DepositButtonProps {
  state: DepositActionButtonState;
}

export function DepositSubmitButton({
  state,
  className,
}: WithClassnames<DepositButtonProps>) {
  const { t } = useTranslation();

  const message = useMemo(() => {
    switch (state) {
      case 'disabled':
        return t(($) => $.buttons.enterAmount);
      case 'approve_loading':
        return t(($) => $.buttons.approveAsset);
      case 'approve_success':
        return (
          <ButtonStateContent.Success
            message={t(($) => $.buttons.assetApproved)}
          />
        );
      case 'approve_idle':
        return t(($) => $.buttons.approve);
      case 'loading':
        return t(($) => $.buttons.confirmDeposit);
      case 'success':
        return (
          <ButtonStateContent.Success
            message={t(($) => $.buttons.assetDeposited)}
          />
        );
      case 'idle':
        return t(($) => $.buttons.deposit);
    }
  }, [t, state]);

  const isLoading = state === 'approve_loading' || state === 'loading';

  return (
    <ValidUserStatePrimaryButton
      className={className}
      type="submit"
      isLoading={isLoading}
      disabled={state === 'disabled'}
      handledErrors={
        HANDLED_BUTTON_USER_STATE_ERRORS.onlyIncorrectConnectedChain
      }
      dataTestId="wallet-deposit-submit-button"
    >
      {message}
    </ValidUserStatePrimaryButton>
  );
}
