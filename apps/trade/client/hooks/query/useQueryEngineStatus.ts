import { ChainEnv } from '@nadohq/client';
import {
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';

function engineStatusQueryKey(chainEnv?: ChainEnv) {
  return ['engineStatus', chainEnv];
}

export function useQueryEngineStatus() {
  const { primaryChainEnv } = useEVMContext();
  const nadoClient = usePrimaryChainNadoClient();
  const disabled = !nadoClient;

  return useQuery({
    queryKey: engineStatusQueryKey(primaryChainEnv),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      return nadoClient.context.engineClient.getStatus();
    },
    enabled: !disabled,
    refetchInterval: 5000,
  });
}
