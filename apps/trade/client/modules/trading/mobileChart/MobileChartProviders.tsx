'use client';

import {
  EVMContextProvider,
  NadoClientContextProvider,
  REACT_QUERY_CONFIG,
  useWagmiConfig,
  WebNadoMetadataContextProvider,
} from '@nadohq/react-client';
import { WithChildren } from '@nadohq/web-common';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WebSubaccountContextProvider } from 'client/context/subaccount/WebSubaccountContextProvider';
import { getWagmiConfigParams } from 'client/modules/app/appData/getWagmiConfigParams';
import { Provider as JotaiProvider } from 'jotai';
import { Suspense } from 'react';
import { WagmiProvider } from 'wagmi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: REACT_QUERY_CONFIG.defaultQueryStaleTime,
    },
  },
});

const { supportedChains, supportedChainEnvs } = getWagmiConfigParams();

function MobileAppDataProviders({ children }: WithChildren) {
  // Minimal config without wallet connectors (read-only for candlestick data)
  const wagmiConfig = useWagmiConfig({
    supportedChains,
    supportedChainEnvs,
  });

  return (
    <WagmiProvider config={wagmiConfig}>
      <EVMContextProvider
        supportedChainEnvs={supportedChainEnvs}
        supportedChains={supportedChains}
        primaryChainEnv={supportedChainEnvs[0]}
        setPrimaryChainEnv={() => {}}
      >
        <WebNadoMetadataContextProvider>
          <NadoClientContextProvider>
            <WebSubaccountContextProvider>
              {children}
            </WebSubaccountContextProvider>
          </NadoClientContextProvider>
        </WebNadoMetadataContextProvider>
      </EVMContextProvider>
    </WagmiProvider>
  );
}

export function MobileChartProviders({ children }: WithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <Suspense>
          <MobileAppDataProviders>{children}</MobileAppDataProviders>
        </Suspense>
      </JotaiProvider>
    </QueryClientProvider>
  );
}
