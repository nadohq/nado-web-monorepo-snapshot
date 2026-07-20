import { useQuery } from '@tanstack/react-query';
import { usePrimaryChainNadoClient } from '../../context';
import { QueryDisabledError } from '../../utils';

export function useQueryCountryCode() {
  const nadoClient = usePrimaryChainNadoClient();

  const disabled = !nadoClient;

  return useQuery({
    queryKey: ['countryCode'],
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      return nadoClient.context.engineClient.getCountryCode();
    },
    enabled: !disabled,
  });
}
