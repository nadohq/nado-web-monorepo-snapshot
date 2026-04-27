import { AccountWithPrivateKey } from '@nadohq/client';
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SubaccountProfile } from '../../modules/subaccounts/types';
import { useEVMContext } from '../evm';
import { SUBACCOUNT_LIMIT } from './consts';
import { useSubaccountNames } from './hooks';
import { SubaccountContext, SubaccountContextData } from './SubaccountContext';
import {
  AppSubaccount,
  SavedSubaccountSigningPreference,
  SubaccountSigningPreference,
} from './types';

interface Props extends PropsWithChildren {
  /*
  Subaccount profile and selection
   */
  selectedSubaccountName: string;
  saveSelectedSubaccountName: (name: string) => void;
  getSavedSubaccountProfile: (
    subaccountName: string,
  ) => SubaccountProfile | undefined;
  saveSubaccountProfile: (
    subaccountName: string,
    profile: SubaccountProfile,
  ) => void;
  getDefaultSubaccountProfile: (subaccountName: string) => SubaccountProfile;
  /*
  Signing preferences
   */
  savedSigningPreference: SubaccountSigningPreference | undefined;
  saveSigningPreference: (
    newPreference: SavedSubaccountSigningPreference,
  ) => void;
  didLoadSavedSigningPreference: boolean;
}

/**
 * Context for managing the current subaccount and its signing preferences
 */
export function BaseSubaccountContextProvider({
  children,
  selectedSubaccountName,
  savedSigningPreference,
  saveSelectedSubaccountName,
  getSavedSubaccountProfile,
  saveSubaccountProfile,
  getDefaultSubaccountProfile,
  saveSigningPreference,
  didLoadSavedSigningPreference,
}: Props) {
  const {
    connectionStatus,
    primaryChain: { id: primaryChainId },
    primaryChainEnv,
  } = useEVMContext();

  /**
   * Subaccount
   */

  const currentSubaccount = useMemo((): AppSubaccount => {
    return {
      name: selectedSubaccountName,
      chainEnv: primaryChainEnv,
      chainId: primaryChainId,
      address: connectionStatus?.address,
    };
  }, [
    selectedSubaccountName,
    primaryChainEnv,
    primaryChainId,
    connectionStatus?.address,
  ]);

  const currentSubaccountProfile = useMemo(
    () =>
      getSavedSubaccountProfile(currentSubaccount.name) ??
      getDefaultSubaccountProfile(currentSubaccount.name),
    [
      currentSubaccount.name,
      getDefaultSubaccountProfile,
      getSavedSubaccountProfile,
    ],
  );

  const getSubaccountProfile = useCallback(
    (subaccountName: string) =>
      getSavedSubaccountProfile(subaccountName) ??
      getDefaultSubaccountProfile(subaccountName),
    [getDefaultSubaccountProfile, getSavedSubaccountProfile],
  );

  const { app: appSubaccountNames } = useSubaccountNames();

  const canAddSubaccount = appSubaccountNames.length < SUBACCOUNT_LIMIT;

  /**
   * Signing preferences
   */

  // Authorized linked signer for the current session - not persisted
  const [linkedSignerForSession, setLinkedSignerForSession] =
    useState<AccountWithPrivateKey>();
  // Clear session linked signer on subaccount changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Only run on subaccount changes
    setLinkedSignerForSession(undefined);
  }, [currentSubaccount]);

  // Consolidate signing preference with any session state
  const signingPreference = useMemo(():
    | SubaccountSigningPreference
    | undefined => {
    if (!savedSigningPreference) {
      return;
    }
    if (savedSigningPreference.type === 'sign_always') {
      return savedSigningPreference;
    }
    return {
      ...savedSigningPreference,
      linkedSigner:
        savedSigningPreference.linkedSigner ?? linkedSignerForSession,
    };
  }, [savedSigningPreference, linkedSignerForSession]);

  // Update fn for signing preference changes
  const updateSigningPreference = useCallback(
    (newValue: SubaccountSigningPreference) => {
      if (newValue.type === 'sign_always') {
        saveSigningPreference({
          type: 'sign_always',
        });
        setLinkedSignerForSession(undefined);
      } else {
        saveSigningPreference({
          type: 'sign_once',
          savePrivateKey: newValue.savePrivateKey,
          privateKey: newValue.savePrivateKey
            ? newValue.linkedSigner?.privateKey
            : undefined,
        });
        setLinkedSignerForSession(newValue.linkedSigner);
      }
    },
    [saveSigningPreference],
  );

  const data: SubaccountContextData = useMemo(() => {
    return {
      currentSubaccount,
      setCurrentSubaccountName: saveSelectedSubaccountName,
      currentSubaccountProfile,
      getSubaccountProfile,
      saveSubaccountProfile,
      appSubaccountNames,
      canAddSubaccount,
      signingPreference: {
        current: signingPreference,
        didLoadPersistedValue: didLoadSavedSigningPreference,
        update: updateSigningPreference,
      },
    };
  }, [
    currentSubaccount,
    saveSelectedSubaccountName,
    currentSubaccountProfile,
    getSubaccountProfile,
    saveSubaccountProfile,
    appSubaccountNames,
    canAddSubaccount,
    signingPreference,
    didLoadSavedSigningPreference,
    updateSigningPreference,
  ]);

  return <SubaccountContext value={data}>{children}</SubaccountContext>;
}
