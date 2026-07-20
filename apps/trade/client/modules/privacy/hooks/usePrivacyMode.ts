import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useCallback } from 'react';

export function usePrivacyMode() {
  const { savedUserState, setSavedUserState } = useSavedUserState();

  const isPrivacyModeEnabled = savedUserState.isPrivacyModeEnabled;

  const setIsPrivacyModeEnabled = useCallback(
    (val: boolean) => {
      setSavedUserState((prev) => {
        prev.isPrivacyModeEnabled = val;
        return prev;
      });
    },
    [setSavedUserState],
  );

  return {
    isPrivacyModeEnabled,
    setIsPrivacyModeEnabled,
  };
}
