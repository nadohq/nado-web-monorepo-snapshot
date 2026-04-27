import {
  calcRealizedDepositRateForTimeRange,
  TimeInSeconds,
} from '@nadohq/client';
import { useAllEdgeSpotProducts } from 'client/pages/MainPage/components/TvlAndYieldTabContent/hooks/useAllEdgeSpotProducts';
import { getSpotMarketTokenName } from 'client/utils/getSpotMarketTokenName';
import { sortBy } from 'lodash';
import { useMemo } from 'react';

export function useEdgeTopDepositAprsCardData() {
  const {
    data: allEdgeSpotProductsData,
    isLoading: isLoadingAllEdgeSpotProductsData,
  } = useAllEdgeSpotProducts();

  const mappedData = useMemo(() => {
    if (!allEdgeSpotProductsData) {
      return;
    }

    const topDepositAprs = sortBy(
      allEdgeSpotProductsData.map((market) => {
        return {
          asset: getSpotMarketTokenName(market),
          rate: calcRealizedDepositRateForTimeRange(
            market.product,
            TimeInSeconds.YEAR,
            0.2,
            market.product.minDepositRate,
          ),
        };
      }),
      // Sort rates in descending order.
      ({ rate }) => -rate,
    ).slice(0, 16); // We show only 16 in UI.

    return {
      topDepositAprs,
    };
  }, [allEdgeSpotProductsData]);

  return {
    data: mappedData,
    isLoading: isLoadingAllEdgeSpotProductsData,
  };
}
