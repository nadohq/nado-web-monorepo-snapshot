import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useCallback } from 'react';

export function useShowOrderbookTotalInQuote() {
  const {
    savedUserState: {
      trading: { showOrderbookTotalInQuote },
    },
    setSavedUserState,
  } = useSavedUserState();

  const setShowOrderbookTotalInQuote = useCallback(
    (selectedValue: boolean) => {
      setSavedUserState((prev) => {
        prev.trading.showOrderbookTotalInQuote = selectedValue;

        return prev;
      });
    },
    [setSavedUserState],
  );

  return {
    setShowOrderbookTotalInQuote,
    showOrderbookTotalInQuote,
  };
}
