import { ChainEnv } from '@nadohq/client';
import { useQuery } from '@tanstack/react-query';
import { useEVMContext } from '../../../context/evm';
import { usePrimaryChainNadoClient } from '../../../context/nadoClient';
import { createQueryKey } from '../../../utils/createQueryKey';
import { QueryDisabledError } from '../../../utils/QueryDisabledError';
import { NOT_CONNECTED_ALT_QUERY_ADDRESS } from '../consts/notConnectedAltQueryAddress';

export function listSubaccountsQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  limit?: number,
) {
  return createQueryKey('listSubaccounts', chainEnv, subaccountOwner, limit);
}

export function useQueryListSubaccounts({
  limit = 100,
}: { limit?: number } = {}) {
  const nadoClient = usePrimaryChainNadoClient();
  const {
    connectionStatus: { address },
    primaryChainEnv,
  } = useEVMContext();

  const subaccountsOwnerForQuery = address ?? NOT_CONNECTED_ALT_QUERY_ADDRESS;

  const disabled = !nadoClient;

  return useQuery({
    queryKey: listSubaccountsQueryKey(
      primaryChainEnv,
      subaccountsOwnerForQuery,
      limit,
    ),
    queryFn: () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      return nadoClient.context.indexerClient.listSubaccounts({
        address: subaccountsOwnerForQuery,
        limit,
      });
    },
    enabled: !disabled,
    // Refetches are handled by WS event listeners
  });
}
