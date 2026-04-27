import { ChainEnv } from '@nadohq/client';
import { useQuery } from '@tanstack/react-query';
import { useEVMContext, usePrimaryChainNadoClient } from '../../context';
import { createQueryKey, QueryDisabledError } from '../../utils';

export function symbolsQueryKey(chainEnv?: ChainEnv) {
  return createQueryKey('symbols', chainEnv);
}

export function useQuerySymbols() {
  const { primaryChainEnv } = useEVMContext();
  const nadoClient = usePrimaryChainNadoClient();

  const disabled = !nadoClient;

  return useQuery({
    queryKey: symbolsQueryKey(primaryChainEnv),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      return nadoClient.context.indexerClient.getV2Symbols();
    },
    enabled: !disabled,
  });
}
