import { useMemo } from 'react';
import { WagmiConfigParams } from '../types';
import { getWagmiConfig } from '../utils';

export function useWagmiConfig({
  supportedChains,
  connectors,
  supportedChainEnvs,
  rpcUrlsByChainId,
}: WagmiConfigParams) {
  return useMemo(() => {
    return getWagmiConfig({
      supportedChains,
      connectors,
      supportedChainEnvs,
      rpcUrlsByChainId,
    });
  }, [supportedChains, connectors, supportedChainEnvs, rpcUrlsByChainId]);
}
