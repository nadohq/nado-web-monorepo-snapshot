import { ChainEnv } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';

export function addressPointsQueryKey(chainEnv?: ChainEnv, address?: string) {
  return createQueryKey('addressPoints', chainEnv, address);
}

export function useQueryAddressPoints() {
  const nadoClient = usePrimaryChainNadoClient();
  const {
    connectionStatus: { address },
    primaryChainEnv,
  } = useEVMContext();

  const disabled = !nadoClient || !address;

  return useQuery({
    queryKey: addressPointsQueryKey(primaryChainEnv, address),
    queryFn: () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      return nadoClient.context.indexerClient.getPoints({
        address,
      });
    },
    enabled: !disabled,
  });
}
