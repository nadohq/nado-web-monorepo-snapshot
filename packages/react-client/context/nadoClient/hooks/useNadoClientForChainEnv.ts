import { ChainEnv } from '@nadohq/client';
import { get } from 'lodash';
import { useNadoClientContext } from '../NadoClientContext';

/**
 * Returns the `client` for the passed in `chainEnv`.
 * Useful when you need to query with a chain env other than the primary.
 */
export function useNadoClientForChainEnv(chainEnv: ChainEnv) {
  const { nadoClientsByChainEnv } = useNadoClientContext();

  return get(nadoClientsByChainEnv, chainEnv, undefined)?.client;
}
