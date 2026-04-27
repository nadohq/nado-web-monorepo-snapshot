import { useEVMContext } from '@nadohq/react-client';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useCallback } from 'react';

/**
 * Do NOT use this hook directly. This is used internally by the SubaccountContextProvider to manage the selected subaccount in local storage.
 */
export function useSavedSelectedSubaccount() {
  const {
    savedUserState: { selectedSubaccountNameByChainEnv },
    setSavedUserState,
    didLoadPersistedValue,
  } = useSavedUserState();

  const { primaryChainEnv } = useEVMContext();

  const selectedSubaccountName =
    selectedSubaccountNameByChainEnv[primaryChainEnv];

  const saveSelectedSubaccountName = useCallback(
    (name: string) =>
      setSavedUserState((prev) => {
        prev.selectedSubaccountNameByChainEnv[primaryChainEnv] = name;
        return prev;
      }),
    [primaryChainEnv, setSavedUserState],
  );

  return {
    selectedSubaccountName,
    saveSelectedSubaccountName,
    didLoadPersistedValue,
  };
}
