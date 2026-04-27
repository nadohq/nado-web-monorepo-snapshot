import {
  ConnectionStatus,
  EVMContextProvider,
  NadoClientContextProvider,
  WebNadoMetadataContextProvider,
  useEVMContext,
  useWagmiConfig,
} from '@nadohq/react-client';
import { WithChildren } from '@nadohq/web-common';
import { useTimeout } from 'ahooks';
import { BrandLoadingWrapper } from 'client/components/BrandIconLoadingWrapper/BrandLoadingWrapper';
import { WebSubaccountContextProvider } from 'client/context/subaccount/WebSubaccountContextProvider';
import { getWagmiConfigParams } from 'client/modules/app/appData/getWagmiConfigParams';
import { useChainEnvQueryParam } from 'client/modules/app/appData/hooks/useChainEnvQueryParam';
import { useSavedPrimaryChainEnv } from 'client/modules/app/appData/hooks/useSavedPrimaryChainEnv';
import { AppVersion } from 'client/modules/app/components/AppVersion';
import { useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';

const wagmiConfigParams = getWagmiConfigParams();

/**
 * Component for aggregating all the nado data related context providers required for the app.
 *
 * - Renders a loading overlay instead of children until initial client load is complete. This prevents initial queries being made on the incorrect
 * chain before localstorage state is loaded.
 * - Listens to the `chain` query param to set the saved chain env if provided. The query param acts as the source of truth and has higher priority
 * than the saved chain env.
 */
export function AppDataProviders({ children }: WithChildren) {
  const {
    savedPrimaryChainEnv,
    setSavedPrimaryChainEnv,
    didLoadPersistedValue,
  } = useSavedPrimaryChainEnv();

  const chainEnvQueryParam = useChainEnvQueryParam({
    supportedChainEnvs: wagmiConfigParams.supportedChainEnvs,
  });
  const [didDetermineChainEnv, setDidDetermineChainEnv] = useState(false);

  useEffect(() => {
    if (didDetermineChainEnv || !didLoadPersistedValue) {
      return;
    }

    // Out of sync - set the saved chain env
    if (chainEnvQueryParam && savedPrimaryChainEnv !== chainEnvQueryParam) {
      console.debug(
        '[AppDataProviders] Setting saved chain env from query param',
        chainEnvQueryParam,
      );
      setSavedPrimaryChainEnv(chainEnvQueryParam);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional set state in effect: only run once
    setDidDetermineChainEnv(true);
  }, [
    chainEnvQueryParam,
    didLoadPersistedValue,
    savedPrimaryChainEnv,
    setSavedPrimaryChainEnv,
    didDetermineChainEnv,
    setDidDetermineChainEnv,
  ]);

  const wagmiConfig = useWagmiConfig(wagmiConfigParams);

  return (
    <WagmiProvider config={wagmiConfig}>
      <EVMContextProvider
        primaryChainEnv={savedPrimaryChainEnv}
        setPrimaryChainEnv={setSavedPrimaryChainEnv}
        supportedChainEnvs={wagmiConfigParams.supportedChainEnvs}
        supportedChains={wagmiConfigParams.supportedChains}
      >
        <WebNadoMetadataContextProvider>
          <InitialLoadOverlay didDetermineChainEnv={didDetermineChainEnv}>
            <NadoClientContextProvider>
              <WebSubaccountContextProvider>
                {children}
              </WebSubaccountContextProvider>
            </NadoClientContextProvider>
          </InitialLoadOverlay>
        </WebNadoMetadataContextProvider>
      </EVMContextProvider>
    </WagmiProvider>
  );
}

const INITIAL_LOAD_CONNECTION_STATUSES: Set<ConnectionStatus['type']> = new Set(
  ['initializing', 'reconnecting'],
);

/**
 * Loading overlay shown when localstorage for last persisted chain env is being loaded & when wagmi is still initializing/reconnecting
 * This must be a child of EVMContextProvider as we need to access the context state
 */
function InitialLoadOverlay({
  children,
  didDetermineChainEnv,
}: WithChildren<{ didDetermineChainEnv: boolean }>) {
  const { connectionStatus } = useEVMContext();
  const isLoadingWalletConnection = INITIAL_LOAD_CONNECTION_STATUSES.has(
    connectionStatus.type,
  );

  const showOverlay = !didDetermineChainEnv || isLoadingWalletConnection;

  // Timeout to show the app in case of some weird case where we're stuck in a loading state
  const [isTimedOut, setIsTimedOut] = useState(false);
  useTimeout(() => {
    if (showOverlay) {
      console.warn(
        '[InitialLoadOverlay] Timed out waiting for initial load to complete',
      );
    }
    setIsTimedOut(true);
  }, 5000);

  return (
    <BrandLoadingWrapper
      indicatorContainerClassName="bg-background absolute inset-0 z-50 h-full w-full"
      isLoading={showOverlay && !isTimedOut}
      extraContent={
        <AppVersion className="absolute right-2 bottom-2 text-xs" />
      }
    >
      {children}
    </BrandLoadingWrapper>
  );
}
