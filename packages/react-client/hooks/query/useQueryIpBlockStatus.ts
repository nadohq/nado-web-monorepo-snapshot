import { useQuery } from '@tanstack/react-query';
import { usePrimaryChainNadoClient } from '../../context';
import { QueryDisabledError } from '../../utils';

export function useQueryIpBlockStatus() {
  const nadoClient = usePrimaryChainNadoClient();

  const disabled = !nadoClient;

  return useQuery({
    queryKey: ['ipBlockStatus'],
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      return nadoClient.context.engineClient.getIpBlockStatus();
    },
    enabled: !disabled,
  });
}
