import { ChainEnv, GetEngineMarketLiquidityResponse } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { QueryState } from 'client/types/QueryState';

interface Params {
  productId?: number;
}

export type MarketLiquidityData = GetEngineMarketLiquidityResponse;

export function marketLiquidityQueryKey(
  chainEnv?: ChainEnv,
  productId?: number,
) {
  return createQueryKey('marketLiquidity', chainEnv, productId);
}

/**
 * Fetches liquidity at each price tick up to the given depth per side of the book.
 * The depth is specified in multiples of the `priceIncrement` for the market.
 *
 * The data returned behaves as follows:
 * - If there are ticks with no liquidity, these are not returned
 * - If we've traversed the entire side of the book, no additional ticks are returned
 */
export function useQueryMarketLiquidity({
  productId,
}: Params): QueryState<MarketLiquidityData> {
  const { primaryChainEnv } = useEVMContext();
  const nadoClient = usePrimaryChainNadoClient();
  const disabled = !nadoClient || !productId;
  return useQuery({
    queryKey: marketLiquidityQueryKey(primaryChainEnv, productId),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      return nadoClient?.market.getMarketLiquidity({
        productId,
        // Backend returns a max depth of 100, to prevent excessive queries from different depths, we hardcode it here
        depth: 100,
      });
    },
    enabled: !disabled,
    // Refetch intervals are handled in useTradingWebSocketSubscriptions
    // IMPORTANT: If this is ever used outside of a trading page, we need to add refetch interval to params
  });
}
