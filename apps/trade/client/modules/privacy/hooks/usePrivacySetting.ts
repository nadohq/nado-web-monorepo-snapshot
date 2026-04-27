import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { PrivacySettingKey } from 'client/modules/privacy/types';
import { useCallback } from 'react';

export function usePrivacySetting(privacyKey: PrivacySettingKey) {
  const { savedUserState, setSavedUserState } = useSavedUserState();

  const isPrivate = savedUserState.privacy[privacyKey];

  const setIsPrivate = useCallback(
    (val: boolean) => {
      setSavedUserState((prev) => {
        prev.privacy[privacyKey] = val;
        return prev;
      });
    },
    [privacyKey, setSavedUserState],
  );

  return [isPrivate, setIsPrivate] as const;
}
