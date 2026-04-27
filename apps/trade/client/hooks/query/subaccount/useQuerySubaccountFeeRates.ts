import { ChainEnv } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { NOT_CONNECTED_ALT_QUERY_ADDRESS } from 'client/hooks/query/consts/notConnectedAltQueryAddress';

export function subaccountFeeRatesQueryKey(
  chainEnv?: ChainEnv,
  sender?: string,
  subaccountName?: string,
) {
  return createQueryKey('subaccountFeeRates', chainEnv, sender, subaccountName);
}

export function useQuerySubaccountFeeRates() {
  const { currentSubaccount } = useSubaccountContext();
  const nadoClient = usePrimaryChainNadoClient();

  const disabled = !nadoClient;

  return useQuery({
    queryKey: subaccountFeeRatesQueryKey(
      currentSubaccount.chainEnv,
      currentSubaccount.address,
      currentSubaccount.name,
    ),
    queryFn: () => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      // Fetch fee rates even when there's no subaccount for a set of "default" fees
      return nadoClient.subaccount.getSubaccountFeeRates({
        subaccountOwner:
          currentSubaccount.address ?? NOT_CONNECTED_ALT_QUERY_ADDRESS,
        subaccountName: currentSubaccount.name ?? '',
      });
    },
    // No refetch here as fee rates are unlikely to change
    enabled: !disabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
