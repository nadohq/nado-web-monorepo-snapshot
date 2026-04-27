import {
  calcBorrowRateForTimeRange,
  NLP_PRODUCT_ID,
  TimeInSeconds,
} from '@nadohq/client';
import { useAllEdgeSpotProducts } from 'client/pages/MainPage/components/TvlAndYieldTabContent/hooks/useAllEdgeSpotProducts';
import { getSpotMarketTokenName } from 'client/utils/getSpotMarketTokenName';
import { sortBy } from 'lodash';
import { useMemo } from 'react';

export function useEdgeLowestBorrowAprsCardData() {
  const {
    data: allEdgeSpotProductsData,
    isLoading: isLoadingAllEdgeSpotProductsData,
  } = useAllEdgeSpotProducts();

  const mappedData = useMemo(() => {
    if (!allEdgeSpotProductsData) {
      return;
    }

    const nonBorrowableProductIds = [NLP_PRODUCT_ID];

    const lowestBorrowAprs = sortBy(
      allEdgeSpotProductsData
        // Filter out products that are not eligible for borrowing
        .filter(({ productId }) => !nonBorrowableProductIds.includes(productId))
        .map((market) => {
          return {
            asset: getSpotMarketTokenName(market),
            rate: calcBorrowRateForTimeRange(
              market.product,
              TimeInSeconds.YEAR,
              market.product.minDepositRate,
            ),
          };
        }),
      // Sort rates in ascending order.
      ({ rate }) => rate,
    ).slice(0, 16); // We show only 16 in UI.

    return {
      lowestBorrowAprs,
    };
  }, [allEdgeSpotProductsData]);

  return {
    data: mappedData,
    isLoading: isLoadingAllEdgeSpotProductsData,
  };
}
