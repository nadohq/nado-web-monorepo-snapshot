import { BigNumbers } from '@nadohq/client';
import { nonNullFilter } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { AllEdgeMarketsData } from 'client/hooks/query/useQueryAllEdgeMarkets';
import { aggregatePieChartOtherItems } from 'client/utils/aggregatePieChartOtherItems';
import { getMarketName } from 'client/utils/getMarketName';

export function createPieChartDataForProducts(
  allEdgeMarketsData: AllEdgeMarketsData,
  valueByProductId: Record<number, BigNumber | undefined> | undefined,
) {
  let maxItemValue: BigNumber = BigNumbers.ZERO;
  const items = Object.entries(valueByProductId ?? {})
    .map(([productId, value]) => {
      const productIdAsNum = Number(productId);

      const market = allEdgeMarketsData.allMarkets[productIdAsNum];

      if (!market || !value) {
        return;
      }

      if (value.gt(maxItemValue)) {
        maxItemValue = value;
      }

      return {
        name: getMarketName(market),
        value,
      };
    })
    .filter(nonNullFilter);

  return aggregatePieChartOtherItems({
    items,
    maxItemValue,
    othersCategoryName: 'Other Markets',
  });
}
