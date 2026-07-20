import {
  appManagedWalletConnector,
  KNOWN_CONNECTOR_IDS,
  RPC_URLS_BY_CHAIN_ID,
  WagmiConfigParams,
} from '@nadohq/react-client';
import {
  SUPPORTED_CHAIN_ENVS,
  SUPPORTED_CHAINS,
} from 'client/modules/app/appData/supportedChains';
import { Chain } from 'viem';

export function getWagmiConfigParams(): WagmiConfigParams {
  return {
    supportedChains: SUPPORTED_CHAINS as readonly [Chain, ...Chain[]],
    supportedChainEnvs: SUPPORTED_CHAIN_ENVS,
    rpcUrlsByChainId: RPC_URLS_BY_CHAIN_ID,
    connectors: [
      appManagedWalletConnector({
        id: KNOWN_CONNECTOR_IDS.customWallet,
      }),
      appManagedWalletConnector({
        id: KNOWN_CONNECTOR_IDS.desktopWalletLink,
      }),
    ],
  };
}
