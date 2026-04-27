import { WithClassnames } from '@nadohq/web-common';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { HANDLED_BUTTON_USER_STATE_ERRORS } from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { ValidUserStatePrimaryButton } from 'client/components/ValidUserStatePrimaryButton/ValidUserStatePrimaryButton';
import { DepositActionButtonState } from 'client/modules/collateral/deposit/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface RepayButtonProps {
  state: DepositActionButtonState;
}

export const RepayDepositButton = ({
  state,
  className,
}: WithClassnames<RepayButtonProps>) => {
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
            message={t(($) => $.buttons.repaymentMade)}
          />
        );
      case 'idle':
        return t(($) => $.buttons.depositAndRepay);
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
    >
      {message}
    </ValidUserStatePrimaryButton>
  );
};
