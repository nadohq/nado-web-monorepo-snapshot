import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useCallback } from 'react';

export function useEnableTradingOrderbookAnimations() {
  const { savedUserState, setSavedUserState } = useSavedUserState();

  const setEnableTradingOrderbookAnimations = useCallback(
    (newVal: boolean) => {
      setSavedUserState((prev) => {
        prev.trading.enableTradingOrderbookAnimations = newVal;
        return prev;
      });
    },
    [setSavedUserState],
  );

  return {
    enableTradingOrderbookAnimations:
      savedUserState.trading.enableTradingOrderbookAnimations,
    setEnableTradingOrderbookAnimations,
  };
}
