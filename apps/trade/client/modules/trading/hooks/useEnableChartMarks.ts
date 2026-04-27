import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useCallback } from 'react';

export function useEnableChartMarks() {
  const { savedUserState, setSavedUserState } = useSavedUserState();

  const setEnableChartMarks = useCallback(
    (newVal: boolean) => {
      setSavedUserState((prev) => {
        prev.trading.enableChartMarks = newVal;
        return prev;
      });
    },
    [setSavedUserState],
  );

  return {
    enableChartMarks: savedUserState.trading.enableChartMarks,
    setEnableChartMarks,
  };
}
