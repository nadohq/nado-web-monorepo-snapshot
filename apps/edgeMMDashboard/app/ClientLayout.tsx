'use client';

import {
  ChainEnv,
  MAINNET_CHAIN_ENVS,
  TESTNET_CHAIN_ENVS,
} from '@nadohq/client';
import {
  EVMContextProvider,
  getPrimaryChain,
  NadoClientContextProvider,
  REACT_QUERY_CONFIG,
  toNonEmptyChainList,
  useWagmiConfig,
  WebNadoMetadataContextProvider,
} from '@nadohq/react-client';
import { WithChildren } from '@nadohq/web-common';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LocationRestrictedDialog } from 'client/components/LocationRestrictedDialog';
import { useState } from 'react';
import { WagmiProvider } from 'wagmi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: REACT_QUERY_CONFIG.defaultQueryStaleTime,
    },
  },
});

const DEFAULT_PRIMARY_CHAIN_ENV = 'inkMainnet' as ChainEnv;

const SUPPORTED_CHAIN_ENVS: ChainEnv[] = [
  ...MAINNET_CHAIN_ENVS,
  ...TESTNET_CHAIN_ENVS,
];

const SUPPORTED_CHAINS = toNonEmptyChainList(
  SUPPORTED_CHAIN_ENVS.map(getPrimaryChain),
);

export function ClientLayout({ children }: WithChildren) {
  const [primaryChainEnv, setPrimaryChainEnv] = useState(
    DEFAULT_PRIMARY_CHAIN_ENV,
  );

  const wagmiConfig = useWagmiConfig({
    supportedChains: SUPPORTED_CHAINS,
    supportedChainEnvs: SUPPORTED_CHAIN_ENVS,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <EVMContextProvider
          supportedChainEnvs={SUPPORTED_CHAIN_ENVS}
          supportedChains={SUPPORTED_CHAINS}
          primaryChainEnv={primaryChainEnv}
          setPrimaryChainEnv={setPrimaryChainEnv}
        >
          <NadoClientContextProvider>
            <WebNadoMetadataContextProvider>
              {children}
              <LocationRestrictedDialog />
            </WebNadoMetadataContextProvider>
          </NadoClientContextProvider>
        </EVMContextProvider>
      </WagmiProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
