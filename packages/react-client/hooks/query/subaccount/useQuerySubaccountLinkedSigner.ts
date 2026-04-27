import { ChainEnv } from '@nadohq/client';
import { useQuery } from '@tanstack/react-query';
import { usePrimaryChainNadoClient } from '../../../context';
import { useSubaccountContext } from '../../../context/subaccount/SubaccountContext';
import { createQueryKey, QueryDisabledError } from '../../../utils';

export function subaccountLinkedSignerQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
) {
  return createQueryKey(
    'subaccountLinkedSigner',
    chainEnv,
    subaccountOwner,
    subaccountName,
  );
}

/**
 * Returns linked signer for the current subaccount as well as the remaining allowed txs for configuring single signature
 */
export function useQuerySubaccountLinkedSigner() {
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
    queryKey: subaccountLinkedSignerQueryKey(
      chainEnv,
      subaccountOwner,
      subaccountName,
    ),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      return nadoClient.subaccount.getSubaccountLinkedSignerWithRateLimit({
        subaccount: {
          subaccountOwner,
          subaccountName,
        },
      });
    },
    enabled: !disabled,
    // Long refreshes as linked signers don't change that often
    refetchInterval: 30000,
  });
}
