import { ChainEnv, IndexerOraclePrice } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';

export function latestOraclePricesQueryKey(
  chainEnv?: ChainEnv,
  productIds?: number[],
) {
  return createQueryKey('latestOraclePrices', chainEnv, productIds);
}

/**
 * Latest oracle prices, in terms of the primary quote (Product ID of 0)
 */
export function useQueryLatestOraclePrices() {
  const { primaryChainEnv } = useEVMContext();
  const nadoClient = usePrimaryChainNadoClient();
  const { data: allMarketsData } = useAllMarkets();

  const allProductIds = allMarketsData?.allMarketsProductIds ?? [];

  const disabled = !nadoClient || !allProductIds.length;

  return useQuery({
    queryKey: latestOraclePricesQueryKey(primaryChainEnv, allProductIds),
    // Keyed by product ID
    queryFn: async (): Promise<Record<number, IndexerOraclePrice>> => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      const queryData = await nadoClient.context.indexerClient.getOraclePrices({
        productIds: allProductIds,
      });

      const keyedData: Record<number, IndexerOraclePrice> = {};
      queryData.forEach((price) => {
        keyedData[price.productId] = price;
      });

      return keyedData;
    },
    enabled: !disabled,
    refetchInterval: 10000,
  });
}
