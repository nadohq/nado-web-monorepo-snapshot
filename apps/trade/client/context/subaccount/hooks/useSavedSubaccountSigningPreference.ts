import { AccountWithPrivateKey, getValidatedHex } from '@nadohq/client';
import {
  SavedSubaccountSigningPreference,
  SubaccountSigningPreference,
  useEVMContext,
} from '@nadohq/react-client';
import { getSubaccountKey } from 'client/context/subaccount/hooks/getSubaccountKey';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { omit } from 'lodash';
import { useCallback, useMemo } from 'react';
import { privateKeyToAccount } from 'viem/accounts';

interface UseSubaccountSigningPreference {
  didLoadPersistedValue: boolean;
  // Undefined if none is saved
  signingPreference?: SubaccountSigningPreference;
  saveSigningPreference: (
    newPreference: SavedSubaccountSigningPreference,
  ) => void;
  // Completely delete any saved settings
  clearSigningPreference: () => void;
}

/**
 * Do NOT call this hook directly. This is used internally by the SubaccountContextProvider to manage subaccount signing preferences in local storage.
 */
export function useSavedSubaccountSigningPreference(
  subaccountName: string,
): UseSubaccountSigningPreference {
  const { primaryChainEnv } = useEVMContext();
  const { savedUserState, setSavedUserState, didLoadPersistedValue } =
    useSavedUserState();

  const subaccountKey = useMemo(() => {
    return getSubaccountKey(primaryChainEnv, subaccountName);
  }, [primaryChainEnv, subaccountName]);

  const signingPreference = useMemo(():
    | SubaccountSigningPreference
    | undefined => {
    if (!subaccountKey) {
      return;
    }

    const savedPreferenceForSubaccount:
      | SavedSubaccountSigningPreference
      | undefined =
      savedUserState.signingPreferenceBySubaccountKey?.[subaccountKey];

    // Map the localstorage type to the expected type
    if (savedPreferenceForSubaccount?.type === 'sign_always') {
      return {
        type: 'sign_always',
      };
    }
    if (savedPreferenceForSubaccount?.type === 'sign_once') {
      let linkedSigner: AccountWithPrivateKey | undefined;
      if (savedPreferenceForSubaccount.privateKey) {
        try {
          const privateKey = getValidatedHex(
            savedPreferenceForSubaccount.privateKey,
          );
          linkedSigner = {
            privateKey,
            account: privateKeyToAccount(privateKey),
          };
        } catch (err) {
          console.error('Error loading saved signing wallet', err);
        }
      }

      return {
        type: 'sign_once',
        linkedSigner,
        savePrivateKey: savedPreferenceForSubaccount.savePrivateKey,
      };
    }

    return;
  }, [subaccountKey, savedUserState.signingPreferenceBySubaccountKey]);

  const saveSigningPreference = useCallback(
    (newPreference: SavedSubaccountSigningPreference) => {
      if (!subaccountKey) {
        return;
      }

      setSavedUserState((prev) => {
        prev.signingPreferenceBySubaccountKey[subaccountKey] = newPreference;

        return prev;
      });
    },
    [setSavedUserState, subaccountKey],
  );

  const clearSigningPreference = useCallback(() => {
    if (!subaccountKey) {
      return;
    }

    setSavedUserState((prev) => {
      prev.signingPreferenceBySubaccountKey = omit(
        prev.signingPreferenceBySubaccountKey,
        subaccountKey,
      );
      return prev;
    });
  }, [setSavedUserState, subaccountKey]);

  return {
    didLoadPersistedValue,
    signingPreference,
    saveSigningPreference,
    clearSigningPreference,
  };
}
