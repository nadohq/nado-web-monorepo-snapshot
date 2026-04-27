import {
  SubaccountSigningPreference,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useSavedSubaccountSigningPreference } from 'client/context/subaccount/hooks/useSavedSubaccountSigningPreference';

/**
 * Hook to get the signing preference for a subaccount, or undefined if none is saved
 *
 * @param subaccountName The subaccount name to get the signing preference for, defaults to the current subaccount
 */
export function useSubaccountSigningPreferenceForSubaccount(
  subaccountName?: string,
): SubaccountSigningPreference | undefined {
  const {
    currentSubaccount,
    signingPreference: { current: currentSubaccountSigningPreference },
  } = useSubaccountContext();

  const targetSubaccountName = subaccountName ?? currentSubaccount.name;

  const { signingPreference: savedSenderSigningPreference } =
    useSavedSubaccountSigningPreference(targetSubaccountName);

  // If `savePrivateKey` is false, the saved signing preference won't include the 1CT key. In this case,
  // we can still take advantage of 1CT (even when `savePrivateKey` is false) by
  // using the current signing preference from `SubaccountContext` instead of the saved one.
  return currentSubaccount.name === targetSubaccountName
    ? currentSubaccountSigningPreference
    : savedSenderSigningPreference;
}
