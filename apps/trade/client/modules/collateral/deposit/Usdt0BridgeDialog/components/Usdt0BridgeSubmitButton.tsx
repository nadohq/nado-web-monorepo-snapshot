import { WithClassnames } from '@nadohq/web-common';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { HANDLED_BUTTON_USER_STATE_ERRORS } from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { ValidUserStatePrimaryButton } from 'client/components/ValidUserStatePrimaryButton/ValidUserStatePrimaryButton';
import { Usdt0BridgeButtonState } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Chain } from 'viem';

interface Props {
  /** Current button state. */
  state: Usdt0BridgeButtonState;
  /** Source chain we are bridging from; used for "Switch to X" when connected to wrong chain. */
  requiredConnectedChain: Chain | undefined;
}

/**
 * Submit button for USDT0 bridge form.
 * Displays appropriate label and styling based on button state.
 */
export function Usdt0BridgeSubmitButton({
  state,
  requiredConnectedChain,
  className,
}: WithClassnames<Props>) {
  const { t } = useTranslation();

  const message = useMemo(() => {
    switch (state) {
      case 'disabled':
        return t(($) => $.buttons.enterAmount);
      case 'idle':
        return t(($) => $.buttons.deposit);
      case 'approve_idle':
        return t(($) => $.buttons.approve);
      case 'approve_loading':
        return t(($) => $.buttons.approveAsset);
      case 'approve_success':
        return (
          <ButtonStateContent.Success
            message={t(($) => $.buttons.assetApproved)}
          />
        );
      case 'loading':
        return t(($) => $.buttons.confirmDeposit);
      case 'success':
        return (
          <ButtonStateContent.Success
            message={t(($) => $.buttons.depositInitiated)}
          />
        );
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
      requiredConnectedChain={requiredConnectedChain}
    >
      {message}
    </ValidUserStatePrimaryButton>
  );
}
