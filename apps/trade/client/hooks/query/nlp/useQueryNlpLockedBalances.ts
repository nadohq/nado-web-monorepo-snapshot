import { ChainEnv } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';

export function nlpLockedBalancesQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
) {
  return createQueryKey(
    'nlpLockedBalances',
    chainEnv,
    subaccountOwner,
    subaccountName,
  );
}

export function useQueryNlpLockedBalances() {
  const nadoClient = usePrimaryChainNadoClient();
  const {
    currentSubaccount: {
      address: subaccountOwner,
      name: subaccountName,
      chainEnv,
    },
  } = useSubaccountContext();

  const disabled = !nadoClient || !subaccountOwner;

  return useQuery({
    queryKey: nlpLockedBalancesQueryKey(
      chainEnv,
      subaccountOwner,
      subaccountName,
    ),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      return nadoClient.context.engineClient.getNlpLockedBalances({
        subaccountOwner,
        subaccountName,
      });
    },
    enabled: !disabled,
  });
}
