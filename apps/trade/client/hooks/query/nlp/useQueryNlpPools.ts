import { ChainEnv } from '@nadohq/client';
import {
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';

function nlpPoolsQueryKey(chainEnv?: ChainEnv) {
  return ['nlpPools', chainEnv];
}

/**
 * Queries pool info (incl. positions, balances, and open orders) for all sub-pools of the NLP
 */
export function useQueryNlpPools() {
  const { primaryChainEnv } = useEVMContext();
  const nadoClient = usePrimaryChainNadoClient();
  const disabled = !nadoClient;

  return useQuery({
    queryKey: nlpPoolsQueryKey(primaryChainEnv),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      return nadoClient.context.engineClient.getNlpPoolInfo();
    },
    enabled: !disabled,
    // Although NLP positions, balances, and open orders can change quite frequently,
    // the information is not time-sensitive, so we don't need to refetch very often.
  });
}
