import { ChainEnv } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';

export function linkedSocialAccountsQueryKey(
  chainEnv?: ChainEnv,
  address?: string,
) {
  return createQueryKey('linkedSocialAccounts', chainEnv, address);
}

export function useQueryLinkedSocialAccounts() {
  const nadoClient = usePrimaryChainNadoClient();
  const {
    connectionStatus: { address },
    primaryChainEnv,
  } = useEVMContext();

  const disabled = !nadoClient || !address;

  return useQuery({
    queryKey: linkedSocialAccountsQueryKey(primaryChainEnv, address),
    queryFn: () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      return nadoClient.context.indexerClient.listSocialAccounts({
        address,
      });
    },
    enabled: !disabled,
  });
}
