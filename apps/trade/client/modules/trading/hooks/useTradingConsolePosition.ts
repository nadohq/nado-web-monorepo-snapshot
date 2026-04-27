import { TradingConsolePosition } from 'client/modules/localstorage/userState/types/tradingSettings';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useCallback } from 'react';

export function useTradingConsolePosition() {
  const { savedUserState, setSavedUserState } = useSavedUserState();

  const setConsolePosition = useCallback(
    (newVal: TradingConsolePosition) => {
      setSavedUserState((prev) => {
        prev.trading.consolePosition = newVal;
        return prev;
      });
    },
    [setSavedUserState],
  );

  return {
    consolePosition: savedUserState.trading.consolePosition,
    setConsolePosition,
  };
}
