import { BigNumbers } from '@nadohq/client';
import { nonNullFilter } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { EdgeAnnotatedSpotMarket } from 'client/hooks/types';
import { aggregatePieChartOtherItems } from 'client/utils/aggregatePieChartOtherItems';
import { getSpotMarketTokenName } from 'client/utils/getSpotMarketTokenName';

export function createPieChartDataForSpotProducts(
  allEdgeSpotProductsData: EdgeAnnotatedSpotMarket[],
  getValue: (market: EdgeAnnotatedSpotMarket) => BigNumber,
) {
  let maxItemValue: BigNumber = BigNumbers.ZERO;

  const items = allEdgeSpotProductsData
    .map((market) => {
      const value = getValue(market);

      if (value.gt(maxItemValue)) {
        maxItemValue = value;
      }

      return {
        name: getSpotMarketTokenName(market),
        value,
      };
    })
    .filter(nonNullFilter);

  return aggregatePieChartOtherItems({
    items,
    maxItemValue,
    othersCategoryName: 'Other Assets',
  });
}
