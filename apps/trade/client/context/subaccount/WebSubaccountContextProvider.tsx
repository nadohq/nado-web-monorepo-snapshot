import {
  BaseSubaccountContextProvider,
  DEFAULT_SUBACCOUNT_AVATAR,
  LinkedSignerSync,
  PRIMARY_SUBACCOUNT_NAME,
  SubaccountProfile,
} from '@nadohq/react-client';
import { WithChildren } from '@nadohq/web-common';
import { useSavedSelectedSubaccount } from 'client/context/subaccount/hooks/useSavedSelectedSubaccount';
import { useSavedSubaccountProfile } from 'client/context/subaccount/hooks/useSavedSubaccountProfile';
import { useSavedSubaccountSigningPreference } from 'client/context/subaccount/hooks/useSavedSubaccountSigningPreference';
import { getDefaultSubaccountUsername } from 'client/modules/subaccounts/utils/getDefaultSubaccountUsername';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function WebSubaccountContextProvider({ children }: WithChildren) {
  const { t } = useTranslation();
  const {
    selectedSubaccountName = PRIMARY_SUBACCOUNT_NAME,
    saveSelectedSubaccountName,
  } = useSavedSelectedSubaccount();

  const { getSavedSubaccountProfile, saveSubaccountProfile } =
    useSavedSubaccountProfile();

  const {
    signingPreference: savedSigningPreference,
    didLoadPersistedValue: didLoadSavedSigningPreference,
    saveSigningPreference,
  } = useSavedSubaccountSigningPreference(selectedSubaccountName);

  const getDefaultSubaccountProfile = useCallback(
    (subaccountName: string): SubaccountProfile => ({
      avatar: DEFAULT_SUBACCOUNT_AVATAR,
      username: getDefaultSubaccountUsername(subaccountName, t),
    }),
    [t],
  );

  return (
    <BaseSubaccountContextProvider
      selectedSubaccountName={selectedSubaccountName}
      saveSelectedSubaccountName={saveSelectedSubaccountName}
      getSavedSubaccountProfile={getSavedSubaccountProfile}
      saveSubaccountProfile={saveSubaccountProfile}
      getDefaultSubaccountProfile={getDefaultSubaccountProfile}
      savedSigningPreference={savedSigningPreference}
      saveSigningPreference={saveSigningPreference}
      didLoadSavedSigningPreference={didLoadSavedSigningPreference}
    >
      <LinkedSignerSync />
      {children}
    </BaseSubaccountContextProvider>
  );
}
