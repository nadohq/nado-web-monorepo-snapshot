import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { useMemo } from 'react';

interface UseFilteredProductIds {
  filteredProductIds: number[];
  isLoading: boolean;
}

/**
 * Returns valid productIds present in the productIds array, or all productIds if productIds is undefined or empty
 */
export function useFilteredProductIds({
  productIds,
}: {
  productIds: number[] | undefined;
}): UseFilteredProductIds {
  const { data: allMarketsData, isLoading: loadingMarkets } = useAllMarkets();

  const filteredProductIds = useMemo(() => {
    if (!allMarketsData) {
      return [];
    }
    if (!productIds?.length) {
      return allMarketsData.allMarketsProductIds;
    }
    const productIdSet = new Set(productIds);
    return allMarketsData.allMarketsProductIds.filter((productId) =>
      productIdSet.has(productId),
    );
  }, [allMarketsData, productIds]);

  return {
    filteredProductIds,
    isLoading: loadingMarkets,
  };
}
