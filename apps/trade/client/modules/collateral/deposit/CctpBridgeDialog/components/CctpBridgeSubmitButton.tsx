import { WithClassnames } from '@nadohq/web-common';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { HANDLED_BUTTON_USER_STATE_ERRORS } from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { ValidUserStatePrimaryButton } from 'client/components/ValidUserStatePrimaryButton/ValidUserStatePrimaryButton';
import { CctpBridgeButtonState } from 'client/modules/collateral/deposit/CctpBridgeDialog/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Chain } from 'viem';

interface Props extends WithClassnames {
  /** Current state of the bridge button. */
  state: CctpBridgeButtonState;
  /** Required chain for the bridge action (source chain). */
  requiredConnectedChain: Chain;
}

/**
 * Submit button for CCTP bridge form with state-aware messaging.
 * The SDK handles approval internally, so this button only shows bridge states.
 */
export function CctpBridgeSubmitButton({
  state,
  requiredConnectedChain,
  className,
}: Props) {
  const { t } = useTranslation();

  const message = useMemo(() => {
    switch (state) {
      case 'disabled':
        return t(($) => $.buttons.enterAmount);
      case 'loading':
        return t(($) => $.buttons.confirmDeposit);
      case 'success':
        return (
          <ButtonStateContent.Success
            message={t(($) => $.buttons.depositInitiated)}
          />
        );
      case 'idle':
        return t(($) => $.buttons.deposit);
    }
  }, [t, state]);

  return (
    <ValidUserStatePrimaryButton
      className={className}
      type="submit"
      isLoading={state === 'loading'}
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
