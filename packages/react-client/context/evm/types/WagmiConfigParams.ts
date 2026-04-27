import { ChainEnv } from '@nadohq/client';
import { Chain } from 'viem';
import { CreateConnectorFn } from 'wagmi';

export interface WagmiConfigParams {
  supportedChains: readonly [Chain, ...Chain[]];
  supportedChainEnvs: ChainEnv[];
  connectors?: CreateConnectorFn[];
  /** Optional RPC URLs by chain ID. When set, a fallback transport is used instead of the chain-default RPC, with ranking enabled so the fastest healthy RPC is preferred. */
  rpcUrlsByChainId?: Record<Chain['id'], string[]>;
}
