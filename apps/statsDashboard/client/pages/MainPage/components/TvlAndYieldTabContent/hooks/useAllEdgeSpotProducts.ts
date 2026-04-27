import { useQueryAllEdgeMarkets } from 'client/hooks/query/useQueryAllEdgeMarkets';
import { useMemo } from 'react';

/**
 * Returning a list of all spot assets. Also includes the primary quote & NLP products, which do not have markets.
 * NLP is treated as special spot product so it can be included or excluded from the list if needed.
 *
 * @returns {{ data: Array|undefined, isLoading: boolean }} An object containing:
 *   - `data`: An array of products or `undefined` if the data is unavailable.
 *   - `isLoading`: A boolean indicating whether the data is still being loaded.
 */
export function useAllEdgeSpotProducts({
  includeNlpProduct = false,
}: { includeNlpProduct?: boolean } = {}) {
  const { data: allEdgeMarketsData, isLoading } = useQueryAllEdgeMarkets();

  const data = useMemo(() => {
    if (!allEdgeMarketsData) {
      return;
    }

    return [
      ...Object.values(allEdgeMarketsData.primaryQuoteProductByChainEnv),
      ...Object.values(allEdgeMarketsData.spotMarkets),
      ...(includeNlpProduct
        ? Object.values(allEdgeMarketsData.nlpProductByChainEnv)
        : []),
    ];
  }, [allEdgeMarketsData, includeNlpProduct]);

  return {
    data,
    isLoading,
  };
}
