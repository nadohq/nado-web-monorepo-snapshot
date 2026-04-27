import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useCallback } from 'react';

export function useSpotLeverageEnabled() {
  const { savedUserState, setSavedUserState } = useSavedUserState();
  const setSpotLeverageEnabled = useCallback(
    (val: boolean) => {
      setSavedUserState((prev) => {
        prev.trading.spotLeverageEnabled = val;
        return prev;
      });
    },
    [setSavedUserState],
  );

  return {
    spotLeverageEnabled: savedUserState.trading.spotLeverageEnabled,
    setSpotLeverageEnabled,
  };
}
