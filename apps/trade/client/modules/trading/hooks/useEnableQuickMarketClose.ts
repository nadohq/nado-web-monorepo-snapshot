import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useCallback } from 'react';

export function useEnableQuickMarketClose() {
  const { savedUserState, setSavedUserState } = useSavedUserState();

  const setEnableQuickMarketClose = useCallback(
    (newVal: boolean) => {
      setSavedUserState((prev) => {
        prev.trading.enableQuickMarketClose = newVal;
        return prev;
      });
    },
    [setSavedUserState],
  );

  return {
    enableQuickMarketClose: savedUserState.trading.enableQuickMarketClose,
    setEnableQuickMarketClose,
  };
}
