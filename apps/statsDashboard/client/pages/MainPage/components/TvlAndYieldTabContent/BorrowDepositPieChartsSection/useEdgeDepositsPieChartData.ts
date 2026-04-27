import { removeDecimals } from '@nadohq/client';
import { useAllEdgeSpotProducts } from 'client/pages/MainPage/components/TvlAndYieldTabContent/hooks/useAllEdgeSpotProducts';
import { createPieChartDataForSpotProducts } from 'client/utils/createPieChartDataForSpotProducts';
import { sumBy } from 'lodash';
import { useMemo } from 'react';

export function useEdgeDepositsPieChartData() {
  const {
    data: allEdgeSpotProductsData,
    isLoading: isLoadingAllEdgeSpotProductsData,
  } = useAllEdgeSpotProducts({
    includeNlpProduct: true,
  });

  const mappedData = useMemo(() => {
    if (!allEdgeSpotProductsData) {
      return;
    }

    const edgeTotalDepositsAtNowByProductUsd =
      createPieChartDataForSpotProducts(allEdgeSpotProductsData, (market) =>
        removeDecimals(
          market.product.totalDeposited.times(market.product.oraclePrice),
        ),
      );
    const edgeTotalDepositsAtNowUsd = sumBy(
      edgeTotalDepositsAtNowByProductUsd,
      ({ value }) => value,
    );

    return {
      edgeTotalDepositsAtNowUsd,
      edgeTotalDepositsAtNowByProductUsd,
    };
  }, [allEdgeSpotProductsData]);

  return {
    data: mappedData,
    isLoading: isLoadingAllEdgeSpotProductsData,
  };
}
