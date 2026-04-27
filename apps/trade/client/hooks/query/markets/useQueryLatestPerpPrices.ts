import { ChainEnv } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';

export function latestPerpPricesQueryKey(
  chainEnv?: ChainEnv,
  productIds?: number[],
) {
  return createQueryKey('latestPerpPrices', chainEnv, productIds);
}

export function useQueryLatestPerpPrices() {
  const { primaryChainEnv } = useEVMContext();
  const nadoClient = usePrimaryChainNadoClient();
  const { data: allMarketsData } = useAllMarkets();

  const allPerpProductIds = allMarketsData?.perpMarketsProductIds ?? [];

  const disabled = !nadoClient || !allPerpProductIds.length;

  return useQuery({
    queryKey: latestPerpPricesQueryKey(primaryChainEnv, allPerpProductIds),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      return nadoClient.perp.getMultiProductPerpPrices({
        productIds: allPerpProductIds,
      });
    },
    enabled: !disabled,
    refetchInterval: 10000,
  });
}
