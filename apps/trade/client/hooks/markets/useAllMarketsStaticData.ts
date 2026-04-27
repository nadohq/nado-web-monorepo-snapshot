import { useEVMContext } from '@nadohq/react-client';
import { useQueryAllMarketsStaticDataByChainEnv } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/useQueryAllMarketsStaticDataByChainEnv';

/**
 * Query hook that returns all static market data for the current chainenv
 */
export function useAllMarketsStaticData() {
  const { primaryChainEnv } = useEVMContext();
  const { data, ...rest } = useQueryAllMarketsStaticDataByChainEnv();

  return {
    data: data?.[primaryChainEnv],
    ...rest,
  };
}
