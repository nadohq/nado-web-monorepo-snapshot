import { createLocalStorageAtom, useStorageAtom } from '@nadohq/web-common';
import { useLocalStorageAddressKey } from 'client/modules/localstorage/hooks/useLocalStorageAddressKey';
import { KeyedByAddr } from 'client/modules/localstorage/types';
import { getUserStateWithDefaults } from 'client/modules/localstorage/userState/defaultUserState';
import { SavedUserState } from 'client/modules/localstorage/userState/types/SavedUserState';
import { setStateActionToState } from 'client/modules/localstorage/utils/setStateActionToState';
import { SetStateAction, useCallback, useMemo } from 'react';

const userStateAtom = createLocalStorageAtom(
  'nado',
  'userState',
  {} as KeyedByAddr<SavedUserState>,
);

export function useSavedUserState() {
  const [userStateAtomValue, setUserStateAtomValue, didLoadPersistedValue] =
    useStorageAtom(userStateAtom, {});
  const addrKey = useLocalStorageAddressKey();

  const savedUserState = useMemo((): SavedUserState => {
    return getUserStateWithDefaults(userStateAtomValue[addrKey]);
  }, [addrKey, userStateAtomValue]);

  const setSavedUserState = useCallback(
    (setState: SetStateAction<SavedUserState>) => {
      setUserStateAtomValue((prev) => {
        const newStateForAddr = setStateActionToState(
          getUserStateWithDefaults(prev[addrKey]),
          setState,
        );
        return {
          ...prev,
          [addrKey]: newStateForAddr,
        };
      });
    },
    [setUserStateAtomValue, addrKey],
  );

  return {
    savedUserState,
    setSavedUserState,
    savedUserStateByAddress: userStateAtomValue,
    setSavedUserStateByAddress: setUserStateAtomValue,
    didLoadPersistedValue,
  };
}
