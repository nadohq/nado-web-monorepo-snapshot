import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useCallback } from 'react';

export function useEnableTradingOrderLines() {
  const { savedUserState, setSavedUserState } = useSavedUserState();

  const setEnableTradingOrderLines = useCallback(
    (newVal: boolean) => {
      setSavedUserState((prev) => {
        prev.trading.enableTradingOrderLines = newVal;
        return prev;
      });
    },
    [setSavedUserState],
  );

  return {
    enableTradingOrderLines: savedUserState.trading.enableTradingOrderLines,
    setEnableTradingOrderLines,
  };
}
