'use client';

import { MAINNET_CHAIN_ENVS, TESTNET_CHAIN_ENVS } from '@nadohq/client';
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
import { DataEnv } from 'client/types';
import { Provider as JotaiProvider } from 'jotai';
import { noop } from 'lodash';
import { WagmiProvider } from 'wagmi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: REACT_QUERY_CONFIG.defaultQueryStaleTime,
    },
  },
});

const { supportedChains, supportedChainEnvs } = (() => {
  const dataEnv = (process.env.NEXT_PUBLIC_DATA_ENV ?? 'testnet') as DataEnv;

  const supportedChainEnvs =
    dataEnv === 'mainnet' ? MAINNET_CHAIN_ENVS : TESTNET_CHAIN_ENVS;

  const supportedChains = toNonEmptyChainList(
    supportedChainEnvs.map(getPrimaryChain),
  );

  return {
    supportedChains,
    supportedChainEnvs,
  };
})();

export function ClientLayout({ children }: WithChildren) {
  const wagmiConfig = useWagmiConfig({ supportedChains, supportedChainEnvs });

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <EVMContextProvider
          supportedChainEnvs={supportedChainEnvs}
          supportedChains={supportedChains}
          primaryChainEnv={supportedChainEnvs[0]}
          setPrimaryChainEnv={noop}
        >
          <NadoClientContextProvider>
            <WebNadoMetadataContextProvider>
              <JotaiProvider>
                {children}
                <LocationRestrictedDialog />
              </JotaiProvider>
            </WebNadoMetadataContextProvider>
          </NadoClientContextProvider>
        </EVMContextProvider>
      </WagmiProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
