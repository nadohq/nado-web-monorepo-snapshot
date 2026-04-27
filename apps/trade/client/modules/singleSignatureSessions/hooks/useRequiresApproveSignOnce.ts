import { useSubaccountContext } from '@nadohq/react-client';

/**
 * Determines if the user wants to use sign once, but the private key is not available
 * @returns True if user wants sign once but private key is not available, false otherwise
 */
export function useRequiresApproveSignOnce() {
  const { signingPreference } = useSubaccountContext();
  const { current: currentSigningPreference } = signingPreference;

  return (
    currentSigningPreference?.type === 'sign_once' &&
    !currentSigningPreference.linkedSigner
  );
}
