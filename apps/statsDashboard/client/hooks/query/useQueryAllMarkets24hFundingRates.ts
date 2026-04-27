import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { useQueryAllEdgeMarkets } from 'client/hooks/query/useQueryAllEdgeMarkets';

export function allMarkets24hFundingRatesQueryKey() {
  return createQueryKey('allMarkets24hFundingRates');
}

export function useQueryAllMarkets24hFundingRates() {
  const { data: allEdgeMarketsData } = useQueryAllEdgeMarkets();
  const nadoClient = usePrimaryChainNadoClient();

  const disabled = !nadoClient || !allEdgeMarketsData;

  return useQuery({
    queryKey: allMarkets24hFundingRatesQueryKey(),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      return nadoClient.market.getMultiProductFundingRates({
        productIds: allEdgeMarketsData.perpMarketsProductIds,
      });
    },
    enabled: !disabled,
    refetchInterval: 10000,
  });
}
