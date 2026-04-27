import { useEVMContext } from '@nadohq/react-client';
import { useQueryAllMarketsByChainEnv } from 'client/hooks/query/markets/allMarketsForChainEnv/useQueryAllMarketsByChainEnv';

/**
 * Query hook that returns all markets for the primary chain env
 */
export function useAllMarkets() {
  const { primaryChainEnv } = useEVMContext();
  const { data, ...rest } = useQueryAllMarketsByChainEnv();

  return {
    data: data?.[primaryChainEnv],
    ...rest,
  };
}
