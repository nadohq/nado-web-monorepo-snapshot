import { BigNumbers } from '@nadohq/client';
import { safeDiv } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { StatsPieChartDataItem } from 'client/components/charts/StatsPieChart/types';

interface Params {
  items: { name: string; value: BigNumber }[];
  maxItemValue: BigNumber;
  othersCategoryName: string;
  othersThresholdFrac?: number;
}

/**
 * Aggregates smaller pie chart items into a single "Other" category based on a threshold fraction.
 * @param {params}
 * @param {Array} params.items - List of items with names and values.
 * @param {BigNumber} params.maxItemValue - The maximum item value for normalization.
 * @param {string} params.othersCategoryName - The label for the aggregated "Other" category.
 * @param {number} [params.othersThresholdFrac=0.01] - The fraction threshold below which items are aggregated into "Other".
 * @returns {StatsPieChartDataItem[]} Processed list of pie chart data items with smaller values aggregated.
 */
export function aggregatePieChartOtherItems({
  items,
  maxItemValue,
  othersCategoryName,
  othersThresholdFrac = 0.01,
}: Params) {
  let othersItemValue = BigNumbers.ZERO;

  const itemsWithAggregatedOthers = items.reduce((acc, item) => {
    const itemFraction = safeDiv(item.value, maxItemValue);

    if (itemFraction.lt(othersThresholdFrac)) {
      othersItemValue = othersItemValue.plus(item.value);
    } else {
      acc.push({
        name: item.name,
        value: item.value.toNumber(),
      });
    }
    return acc;
  }, [] as StatsPieChartDataItem[]);

  if (othersItemValue.gt(BigNumbers.ZERO)) {
    itemsWithAggregatedOthers.push({
      name: othersCategoryName,
      value: othersItemValue.toNumber(),
    });
  }

  return itemsWithAggregatedOthers;
}
