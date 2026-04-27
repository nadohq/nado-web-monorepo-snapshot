import { ChainEnv } from '@nadohq/client';
import {
  getChainEnvName,
  getChainName,
  useEVMContext,
} from '@nadohq/react-client';
import {
  UserStateError,
  useUserStateError,
} from 'client/hooks/subaccount/useUserStateError';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useTranslation } from 'react-i18next';
import { Chain } from 'viem';

/** Commonly used handledErrors by useButtonUserStateErrorProps and ValidUserStatePrimaryButton.*/
export const HANDLED_BUTTON_USER_STATE_ERRORS = {
  /** Only handle the incorrect chain error.*/
  onlyIncorrectConnectedChain: {
    not_connected: false,
    incorrect_connected_chain: true,
    incorrect_chain_env: false,
    requires_initial_deposit: false,
    requires_sign_once_approval: false,
    requires_single_signature_setup: false,
  },
  /** Only handle the incorrect chain env error. */
  onlyIncorrectChainEnv: {
    not_connected: false,
    incorrect_connected_chain: false,
    incorrect_chain_env: true,
    requires_initial_deposit: false,
    requires_sign_once_approval: false,
    requires_single_signature_setup: false,
  },
} satisfies Record<string, Record<UserStateError, boolean>>;

export interface UseButtonUserStateErrorPropsParams {
  /** If undefined will default to handling all errors*/
  handledErrors?: Record<UserStateError, boolean>;

  /** Some usages (ex. referrals) require a specific chain, this has precedence over the `incorrect_connected_chain` error*/
  requiredConnectedChain?: Chain;

  /** Useful when a specific chain env is required for an action, takes precedence over `incorrect_connected_chain`. */
  requiredChainEnv?: ChainEnv;
}

export function useButtonUserStateErrorProps({
  handledErrors,
  requiredConnectedChain,
  requiredChainEnv,
}: UseButtonUserStateErrorPropsParams = {}) {
  const { t } = useTranslation();
  const userStateError = useUserStateError({
    requiredConnectedChain,
    requiredChainEnv,
  });
  const { show } = useDialog();
  const {
    switchConnectedChain,
    primaryChain,
    primaryChainEnv,
    setPrimaryChainEnv,
  } = useEVMContext();

  // if the userStateError should not be handled return early.
  if (!userStateError || handledErrors?.[userStateError] === false) {
    return;
  }

  switch (userStateError) {
    case 'not_connected':
      return {
        onClick: () => show({ type: 'connect', params: {} }),
        children: t(($) => $.buttons.connectWallet),
      };
    case 'incorrect_chain_env':
      const destinationChainEnv = requiredChainEnv ?? primaryChainEnv;

      return {
        onClick: () => setPrimaryChainEnv(destinationChainEnv),
        children: t(($) => $.buttons.switchToChain, {
          chainName: getChainEnvName(destinationChainEnv),
        }),
      };
    case 'incorrect_connected_chain':
      const destinationChain = requiredConnectedChain ?? primaryChain;

      return {
        onClick: () => switchConnectedChain(destinationChain.id),
        children: t(($) => $.buttons.switchToChain, {
          chainName: getChainName(destinationChain),
        }),
      };
    case 'requires_initial_deposit':
      return {
        onClick: () => show({ type: 'deposit_options', params: {} }),
        children: t(($) => $.buttons.depositToStartTrading),
      };
    case 'requires_sign_once_approval':
      return {
        onClick: () =>
          show({ type: 'single_signature_reapproval', params: {} }),
        children: t(($) => $.buttons.approveTrading),
      };
    case 'requires_single_signature_setup':
      return {
        onClick: () => show({ type: 'signature_mode_settings', params: {} }),
        children: t(($) => $.buttons.setup1CT),
      };
  }
}
