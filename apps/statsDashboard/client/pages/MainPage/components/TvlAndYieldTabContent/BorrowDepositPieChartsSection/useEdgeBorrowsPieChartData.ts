import { removeDecimals } from '@nadohq/client';
import { useAllEdgeSpotProducts } from 'client/pages/MainPage/components/TvlAndYieldTabContent/hooks/useAllEdgeSpotProducts';
import { createPieChartDataForSpotProducts } from 'client/utils/createPieChartDataForSpotProducts';
import { sumBy } from 'lodash';
import { useMemo } from 'react';

export function useEdgeBorrowsPieChartData() {
  const {
    data: allEdgeSpotProductsData,
    isLoading: isLoadingAllEdgeSpotProductsData,
  } = useAllEdgeSpotProducts();

  const mappedData = useMemo(() => {
    if (!allEdgeSpotProductsData) {
      return;
    }

    const edgeTotalBorrowsAtNowByProductUsd = createPieChartDataForSpotProducts(
      allEdgeSpotProductsData,
      (market) =>
        removeDecimals(
          market.product.totalBorrowed.times(market.product.oraclePrice),
        ),
    );

    const edgeTotalBorrowsAtNowUsd = sumBy(
      edgeTotalBorrowsAtNowByProductUsd,
      ({ value }) => value,
    );

    return {
      edgeTotalBorrowsAtNowUsd,
      edgeTotalBorrowsAtNowByProductUsd,
    };
  }, [allEdgeSpotProductsData]);

  return {
    data: mappedData,
    isLoading: isLoadingAllEdgeSpotProductsData,
  };
}
