import { ChainEnv, GetEngineMaxMintNlpAmountParams } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

type Params = Omit<
  GetEngineMaxMintNlpAmountParams,
  'subaccountOwner' | 'subaccountName'
>;

export function maxMintNlpAmountQueryKey(
  chainEnv?: ChainEnv,
  sender?: string,
  subaccountName?: string,
  spotLeverage?: boolean,
) {
  return createQueryKey(
    'maxMintNlpAmount',
    chainEnv,
    sender,
    subaccountName,
    spotLeverage,
  );
}

export function useQueryMaxMintNlpAmount(params: Params) {
  const { currentSubaccount } = useSubaccountContext();
  const nadoClient = usePrimaryChainNadoClient();

  const queryParams = useMemo(():
    | GetEngineMaxMintNlpAmountParams
    | undefined => {
    if (!currentSubaccount.address) {
      return undefined;
    }

    return {
      ...params,
      subaccountOwner: currentSubaccount.address,
      subaccountName: currentSubaccount.name,
    };
  }, [currentSubaccount.address, currentSubaccount.name, params]);

  const disabled = !nadoClient || !queryParams;

  return useQuery({
    queryKey: maxMintNlpAmountQueryKey(
      currentSubaccount.chainEnv,
      queryParams?.subaccountOwner,
      queryParams?.subaccountName,
      queryParams?.spotLeverage,
    ),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      return nadoClient.spot.getMaxMintNlpAmount(queryParams);
    },
    enabled: !disabled,
    // Refetches are handled by WS event listeners
  });
}
