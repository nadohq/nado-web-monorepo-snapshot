import { ChainEnv } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { NOT_CONNECTED_ALT_QUERY_ADDRESS } from 'client/hooks/query/consts/notConnectedAltQueryAddress';

export function addressPointsQueryKey(chainEnv?: ChainEnv, address?: string) {
  return createQueryKey('addressPoints', chainEnv, address);
}

export function useQueryAddressPoints() {
  const nadoClient = usePrimaryChainNadoClient();
  const {
    connectionStatus: { address },
    primaryChainEnv,
  } = useEVMContext();

  const disabled = !nadoClient;
  const addressForQuery = address ?? NOT_CONNECTED_ALT_QUERY_ADDRESS;

  return useQuery({
    queryKey: addressPointsQueryKey(primaryChainEnv, addressForQuery),
    queryFn: () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      return nadoClient.context.indexerClient.getPoints({
        address: addressForQuery,
      });
    },
    enabled: !disabled,
  });
}
