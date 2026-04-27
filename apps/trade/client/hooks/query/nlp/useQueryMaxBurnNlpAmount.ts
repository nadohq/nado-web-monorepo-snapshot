import { ChainEnv } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';

export function maxBurnNlpAmountQueryKey(
  chainEnv?: ChainEnv,
  sender?: string,
  subaccountName?: string,
) {
  return createQueryKey('maxBurnNlpAmount', chainEnv, sender, subaccountName);
}

export function useQueryMaxBurnNlpAmount() {
  const nadoClient = usePrimaryChainNadoClient();
  const {
    currentSubaccount: {
      address: subaccountOwner,
      name: subaccountName,
      chainEnv,
    },
  } = useSubaccountContext();

  const disabled = !subaccountOwner || !nadoClient;

  return useQuery({
    queryKey: maxBurnNlpAmountQueryKey(
      chainEnv,
      subaccountOwner,
      subaccountName,
    ),
    queryFn: async (): Promise<BigNumber> => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      return nadoClient.context.engineClient.getMaxBurnNlpAmount({
        subaccountOwner,
        subaccountName,
      });
    },
    enabled: !disabled,
  });
}
