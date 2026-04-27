import { useNadoClientContext } from '../NadoClientContext';

/**
 * Utility fn that returns the Nado client instance for the currently selected chain env
 */
export function usePrimaryChainNadoClient() {
  const { primaryChainNadoClient } = useNadoClientContext();

  return primaryChainNadoClient?.client;
}
