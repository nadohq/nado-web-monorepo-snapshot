import { toBigNumber } from '@nadohq/client';
import {
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';

export function useQueryNSubmissions() {
  const { primaryChainEnv } = useEVMContext();
  const nadoClient = usePrimaryChainNadoClient();
  const disabled = !nadoClient;

  return useQuery({
    queryKey: ['nSubmissions', primaryChainEnv],
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      return toBigNumber(
        await nadoClient.context.contracts.endpoint.read.nSubmissions(),
      );
    },
    enabled: !disabled,
    // `nSubmissions` is only updated every minute.
    refetchInterval: 60000,
  });
}
