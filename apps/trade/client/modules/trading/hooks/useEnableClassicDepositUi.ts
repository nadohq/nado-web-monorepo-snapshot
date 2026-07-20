import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useCallback } from 'react';

export function useEnableClassicDepositUi() {
  const { savedUserState, setSavedUserState, didLoadPersistedValue } =
    useSavedUserState();

  const setEnableClassicDepositUi = useCallback(
    (newVal: boolean) => {
      setSavedUserState((prev) => {
        prev.trading.enableClassicDepositUi = newVal;
        return prev;
      });
    },
    [setSavedUserState],
  );

  return {
    enableClassicDepositUi: savedUserState.trading.enableClassicDepositUi,
    setEnableClassicDepositUi,
    didLoadPersistedValue,
  };
}
