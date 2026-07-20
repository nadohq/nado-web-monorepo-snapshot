import { getDefaultChains } from '@funkit/connect';
import { ChainEnv } from '@nadohq/client';
import {
  BRIDGE_CHAINS,
  getPrimaryChain,
  toNonEmptyChainList,
} from '@nadohq/react-client';
import { DataEnv } from 'common/environment/baseClientEnv';
import { clientEnv } from 'common/environment/clientEnv';
import { mainnet } from 'viem/chains';

const CHAIN_ENVS_BY_DATA_ENV: Record<DataEnv, ChainEnv[]> = {
  local: ['local'],
  nadoTestnet: ['inkTestnet'],
  nadoMainnet: ['inkMainnet'],
};

export const SUPPORTED_CHAIN_ENVS =
  CHAIN_ENVS_BY_DATA_ENV[clientEnv.base.dataEnv];

export const SUPPORTED_CHAINS = toNonEmptyChainList(
  new Set([
    ...SUPPORTED_CHAIN_ENVS.map(getPrimaryChain),
    // ETH Mainnet is always required for ENS name resolution
    mainnet,
    // Add chains needed for bridging
    ...BRIDGE_CHAINS,
    // Add the chains Fun Checkout can source deposits from
    ...getDefaultChains(),
  ]),
);
