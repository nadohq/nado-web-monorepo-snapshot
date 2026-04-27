import { ChainEnv } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';

export function allMarkets24hFundingRatesQueryKey(
  chainEnv?: ChainEnv,
  productIds?: number[],
) {
  return createQueryKey('allMarkets24hFundingRates', chainEnv, productIds);
}

export function useQueryAllMarkets24hFundingRates() {
  const nadoClient = usePrimaryChainNadoClient();
  const { primaryChainEnv } = useEVMContext();
  const { data: allMarketsData } = useAllMarkets();

  const allPerpProductIds = allMarketsData?.perpMarketsProductIds ?? [];

  const disabled = !nadoClient || !allPerpProductIds.length;

  return useQuery({
    queryKey: allMarkets24hFundingRatesQueryKey(
      primaryChainEnv,
      allPerpProductIds,
    ),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      return nadoClient.market.getMultiProductFundingRates({
        productIds: allPerpProductIds,
      });
    },
    enabled: !disabled,
    refetchInterval: 10000,
  });
}
