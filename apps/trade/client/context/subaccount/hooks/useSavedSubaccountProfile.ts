import { SubaccountProfile, useEVMContext } from '@nadohq/react-client';
import { getSubaccountKey } from 'client/context/subaccount/hooks/getSubaccountKey';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useCallback } from 'react';

/**
 * Do NOT use this hook directly. This is used internally by the SubaccountContextProvider to manage subaccount profiles in local storage.
 */
export function useSavedSubaccountProfile() {
  const {
    savedUserState: { profileBySubaccountKey },
    setSavedUserState,
  } = useSavedUserState();

  const { primaryChainEnv } = useEVMContext();

  const saveSubaccountProfile = useCallback(
    (subaccountName: string, data: SubaccountProfile) => {
      const key = getSubaccountKey(primaryChainEnv, subaccountName);
      const { username, avatar } = data;

      setSavedUserState((prev) => {
        prev.profileBySubaccountKey[key] = { username, avatar };
        return prev;
      });
    },
    [setSavedUserState, primaryChainEnv],
  );

  const getSavedSubaccountProfile = useCallback(
    (subaccountName: string) => {
      const key = getSubaccountKey(primaryChainEnv, subaccountName);
      return profileBySubaccountKey[key];
    },
    [primaryChainEnv, profileBySubaccountKey],
  );

  return {
    getSavedSubaccountProfile,
    saveSubaccountProfile,
  };
}
