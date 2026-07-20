import { useSavedGlobalState } from 'client/modules/localstorage/globalState/useSavedGlobalState';
import { useCallback } from 'react';

export function useMultiWagmi() {
  const { savedGlobalState, setSavedGlobalState } = useSavedGlobalState();
  const activeWagmiProvider = savedGlobalState.activeWagmiProvider;

  const switchWagmiProvider = useCallback(
    (provider: typeof activeWagmiProvider) => {
      if (activeWagmiProvider !== provider) {
        setSavedGlobalState((prev) => {
          prev.activeWagmiProvider = provider;
          return prev;
        });
      }
    },
    [activeWagmiProvider, setSavedGlobalState],
  );

  return {
    activeWagmiProvider,
    switchWagmiProvider,
  };
}
