import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useCallback } from 'react';

export function useEnableTradingPositionLines() {
  const { savedUserState, setSavedUserState } = useSavedUserState();

  const setEnableTradingPositionLines = useCallback(
    (newVal: boolean) => {
      setSavedUserState((prev) => {
        prev.trading.enableTradingPositionLines = newVal;
        return prev;
      });
    },
    [setSavedUserState],
  );

  return {
    enableTradingPositionLines:
      savedUserState.trading.enableTradingPositionLines,
    setEnableTradingPositionLines,
  };
}
