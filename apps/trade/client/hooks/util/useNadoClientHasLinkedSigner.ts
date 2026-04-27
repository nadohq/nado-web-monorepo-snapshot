import { NadoClient } from '@nadohq/client';
import { usePrimaryChainNadoClient } from '@nadohq/react-client';

export function useNadoClientHasLinkedSigner() {
  const nadoClient = usePrimaryChainNadoClient();

  return getNadoClientHasLinkedSigner(nadoClient);
}

/**
 * Trigger orders are only fetched when the client has a linked signer (i.e. single signature is active)
 * We shouldn't use `useIsSingleSignatureSession` as client creation is async, meaning that there's
 * going to be a slight mismatch between the state of the UI hook and the actual nado client
 *
 * This function is extracted for use in query functions because of an issue with reactivity
 * The `linkedSigner`property on the SDK isn’t reactive, so updates to it don’t trigger an immediate rerender.
 */
export function getNadoClientHasLinkedSigner(
  nadoClient: NadoClient | undefined,
) {
  return nadoClient?.context.linkedSignerWalletClient != null;
}
