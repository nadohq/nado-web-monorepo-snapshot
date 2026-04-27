import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useCallback } from 'react';

export function useEnableTradingNotifications() {
  const { savedUserState, setSavedUserState } = useSavedUserState();

  const setEnableTradingNotifications = useCallback(
    (newVal: boolean) => {
      setSavedUserState((prev) => {
        prev.trading.enableTradingNotifications = newVal;
        return prev;
      });
    },
    [setSavedUserState],
  );

  return {
    enableTradingNotifications:
      savedUserState.trading.enableTradingNotifications,
    setEnableTradingNotifications,
  };
}
