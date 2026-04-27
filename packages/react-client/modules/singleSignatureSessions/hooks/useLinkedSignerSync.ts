import { useEffect, useRef } from 'react';
import { Account, zeroAddress } from 'viem';
import { useNadoClientContext } from '../../../context';
import { useSubaccountContext } from '../../../context/subaccount';
import { useQuerySubaccountLinkedSigner } from '../../../hooks/query/subaccount/useQuerySubaccountLinkedSigner';

/**
 * Synchronization of state for linked signers:
 * - When the linked signer changes in `SubaccountContext`, change NadoClient appropriately
 * - Update local state given backend state on initial load
 */
export function useLinkedSignerSync() {
  const { setLinkedSigner, nadoClientsByChainEnv } = useNadoClientContext();
  const {
    signingPreference: {
      current: localSigningPreference,
      didLoadPersistedValue: didLoadSigningPreferencePersistedValue,
      update: updateSigningPreference,
    },
    currentSubaccount,
  } = useSubaccountContext();
  const { chainEnv } = currentSubaccount;

  // Sync nado client & local state
  const didLoadNadoClients = !!nadoClientsByChainEnv;
  useEffect(() => {
    if (!didLoadNadoClients) {
      return;
    }

    let linkedSignerAccount: Account | null = null;
    if (
      localSigningPreference?.type === 'sign_once' &&
      localSigningPreference?.linkedSigner
    ) {
      linkedSignerAccount = localSigningPreference.linkedSigner.account;
    }

    console.debug(
      `[useLinkedSignerSync] Updating linked signer on Nado Client for ${chainEnv}`,
      linkedSignerAccount?.address ?? null,
    );
    setLinkedSigner({
      signerAccount: linkedSignerAccount,
      chainEnv,
    });
  }, [didLoadNadoClients, localSigningPreference, chainEnv, setLinkedSigner]);

  const { data: backendLinkedSigner } = useQuerySubaccountLinkedSigner();

  // Sync backend state & local state, but do this only once on initial load
  // This prevents weird race conditions when user changes between sign always & sign once, but the indexer query
  // state has not yet updated
  const hasRunBackendSyncRef = useRef(false);

  // Reset on subaccount & chainenv changes
  useEffect(() => {
    hasRunBackendSyncRef.current = false;
  }, [
    currentSubaccount.chainEnv,
    currentSubaccount.address,
    currentSubaccount.name,
  ]);

  // Sync backend state & local state
  useEffect(() => {
    if (
      !currentSubaccount.address ||
      hasRunBackendSyncRef.current ||
      !didLoadSigningPreferencePersistedValue ||
      !backendLinkedSigner
    ) {
      return;
    }

    const backendIsSignOnce = backendLinkedSigner.signer !== zeroAddress;
    if (
      // Nothing configured locally
      localSigningPreference == null &&
      backendIsSignOnce
    ) {
      updateSigningPreference({
        type: 'sign_once',
        linkedSigner: undefined,
        savePrivateKey: true,
      });
    } else if (
      localSigningPreference?.type === 'sign_once' &&
      !backendIsSignOnce
    ) {
      updateSigningPreference({
        type: 'sign_always',
      });
    } else if (
      localSigningPreference?.type === 'sign_always' &&
      backendIsSignOnce
    ) {
      updateSigningPreference({
        type: 'sign_once',
        linkedSigner: undefined,
        savePrivateKey: true,
      });
    } else if (
      // Signers are out of sync - reset but clear local signer
      localSigningPreference?.type === 'sign_once' &&
      backendIsSignOnce &&
      localSigningPreference.linkedSigner?.account.address.toLowerCase() !==
        backendLinkedSigner.signer.toLowerCase()
    ) {
      // Preserve the user's remember approval preference — when savePrivateKey
      // is false, the missing local signer is expected (key intentionally not persisted)
      updateSigningPreference({
        type: 'sign_once',
        linkedSigner: undefined,
        savePrivateKey: localSigningPreference.savePrivateKey,
      });
    }
    hasRunBackendSyncRef.current = true;
  }, [
    backendLinkedSigner,
    currentSubaccount.address,
    didLoadSigningPreferencePersistedValue,
    updateSigningPreference,
    localSigningPreference,
  ]);
}
