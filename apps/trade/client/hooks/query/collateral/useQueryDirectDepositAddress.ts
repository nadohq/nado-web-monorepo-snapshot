import {
  ChainEnv,
  GetIndexerSubaccountDDAParams,
  GetIndexerSubaccountDDAResponse,
} from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';

export function directDepositAddressQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
) {
  return createQueryKey(
    'directDepositAddress',
    chainEnv,
    subaccountOwner,
    subaccountName,
  );
}

export function useQueryDirectDepositAddress() {
  const {
    currentSubaccount: { address, name, chainEnv },
  } = useSubaccountContext();
  const nadoClient = usePrimaryChainNadoClient();

  const disabled = !nadoClient || !address;

  return useQuery({
    queryKey: directDepositAddressQueryKey(chainEnv, address, name),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const params: GetIndexerSubaccountDDAParams = {
        subaccount: {
          subaccountOwner: address,
          subaccountName: name,
        },
      };

      const response: GetIndexerSubaccountDDAResponse =
        await nadoClient.context.indexerClient.getSubaccountDDA(params);

      return response.address;
    },
    enabled: !disabled,
  });
}
