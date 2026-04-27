import { ChainEnv } from '@nadohq/client';
import {
  appManagedWalletConnector,
  BRIDGE_CHAINS,
  getPrimaryChain,
  KNOWN_CONNECTOR_IDS,
  RPC_URLS_BY_CHAIN_ID,
  toNonEmptyChainList,
  WagmiConfigParams,
} from '@nadohq/react-client';
import { DataEnv } from 'common/environment/baseClientEnv';
import { clientEnv } from 'common/environment/clientEnv';
import { SENSITIVE_DATA } from 'common/environment/sensitiveData';
import { mainnet } from 'viem/chains';
import { injected } from 'wagmi';
import { walletConnect } from 'wagmi/connectors';

const CHAIN_ENVS_BY_DATA_ENV: Record<DataEnv, ChainEnv[]> = {
  local: ['local'],
  nadoTestnet: ['inkTestnet'],
  nadoMainnet: ['inkMainnet'],
};

export function getWagmiConfigParams(): WagmiConfigParams {
  const supportedChainEnvs = CHAIN_ENVS_BY_DATA_ENV[clientEnv.base.dataEnv];
  const supportedChains = new Set([
    ...supportedChainEnvs.map(getPrimaryChain),
    // ETH Mainnet is always required for ENS name resolution
    mainnet,
    // Add chains needed for bridging
    ...BRIDGE_CHAINS,
  ]);

  return {
    supportedChains: toNonEmptyChainList(supportedChains),
    supportedChainEnvs,
    rpcUrlsByChainId: RPC_URLS_BY_CHAIN_ID,
    connectors: [
      injected(),
      walletConnect({
        projectId: SENSITIVE_DATA.walletConnectProjectId,
        metadata: {
          name: 'Nado',
          description: 'Nado',
          url: 'https://app.nado.xyz/',
          icons: ['https://app.nado.xyz/nado-icon.svg'],
        },
      }),
      appManagedWalletConnector({
        id: KNOWN_CONNECTOR_IDS.customWallet,
      }),
      appManagedWalletConnector({
        id: KNOWN_CONNECTOR_IDS.desktopWalletLink,
      }),
    ],
  };
}
