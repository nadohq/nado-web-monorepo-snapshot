import { BigNumbers } from '@nadohq/client';
import { useQueryAllMarkets24hFundingRates } from 'client/hooks/query/useQueryAllMarkets24hFundingRates';
import { useAllEdgePerpMarkets } from 'client/pages/MainPage/components/OpenInterestFundingAndLiquidationsTabContent/hooks/useAllEdgePerpMarkets';
import { getMarketName } from 'client/utils/getMarketName';
import { get, sortBy } from 'lodash';
import { useMemo } from 'react';

export function useEdgeTopFundingRatesCardData() {
  const {
    data: allEdgePerpMarketsData,
    isLoading: isLoadingAllEdgePerpMarketsData,
  } = useAllEdgePerpMarkets();

  const {
    data: allMarketsFundingRatesData,
    isLoading: isLoadingAllMarketsFundingRatesData,
  } = useQueryAllMarkets24hFundingRates();

  const mappedData = useMemo(() => {
    if (!allEdgePerpMarketsData || !allMarketsFundingRatesData) {
      return;
    }

    const topFundingRates = sortBy(
      allEdgePerpMarketsData.map((market) => {
        const productFundingRate =
          get(allMarketsFundingRatesData, market.productId)?.fundingRate ??
          BigNumbers.ZERO;

        // Funding rates are daily. Multiply by 365 to get annualized rate.
        const productFundingRateFraction = productFundingRate
          .times(365)
          .toNumber();

        return {
          asset: getMarketName(market),
          rate: productFundingRateFraction,
        };
      }),
      // Sort by absolute rate in descending order.
      ({ rate }) => -Math.abs(rate),
    ).slice(0, 16); // We show only 16 in UI.

    return {
      topFundingRates,
    };
  }, [allEdgePerpMarketsData, allMarketsFundingRatesData]);

  return {
    data: mappedData,
    isLoading:
      isLoadingAllEdgePerpMarketsData || isLoadingAllMarketsFundingRatesData,
  };
}
