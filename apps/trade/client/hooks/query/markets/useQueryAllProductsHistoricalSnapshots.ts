import { ChainEnv, IndexerProductSnapshot } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { useGetNowTimeInSeconds } from 'client/hooks/util/useGetNowTime';

export function allProductsHistoricalSnapshotsQueryKey(
  chainEnv?: ChainEnv,
  productIds?: number[],
  secondsBeforeNow?: number[],
) {
  return createQueryKey(
    'allProductsHistoricalSnapshot',
    chainEnv,
    productIds,
    secondsBeforeNow,
  );
}

/**
 * Fetches the latest snapshot available BEFORE now - each value in `secondsBeforeNow`.
 * If a snapshot does not exist, the value for the product ID key will be undefined.
 *
 * @param secondsBeforeNow
 */
export function useQueryAllProductsHistoricalSnapshots(
  secondsBeforeNow: number[],
) {
  const nadoClient = usePrimaryChainNadoClient();
  const { primaryChainEnv } = useEVMContext();
  const { data: allMarketsData } = useAllMarkets();
  const getNowTimeInSeconds = useGetNowTimeInSeconds();

  const allProductIds = allMarketsData?.allMarketsProductIds ?? [];

  const disabled = !nadoClient || allProductIds.length === 0;

  return useQuery({
    queryKey: allProductsHistoricalSnapshotsQueryKey(
      primaryChainEnv,
      allProductIds,
      secondsBeforeNow,
    ),
    queryFn: async (): Promise<Record<number, IndexerProductSnapshot>[]> => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const now = getNowTimeInSeconds();
      const maxTimestampInclusive = secondsBeforeNow.map((s) => now - s);

      const baseResponse = await nadoClient.market.getMultiProductSnapshots({
        maxTimestampInclusive,
        productIds: allProductIds,
      });

      // The base response is a map keyed by the values in `maxTimestampInclusive`.
      // We instead just return an array in the same order, so the caller can more
      // easily access the data.
      return maxTimestampInclusive.map((t) => baseResponse[t]);
    },
    enabled: !disabled,
    refetchInterval: 30000,
  });
}
