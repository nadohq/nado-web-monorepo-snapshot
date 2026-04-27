import { ChartDataItemKey } from 'client/modules/charts/types';
import { getTradeAppColorVar } from 'client/modules/theme/colorVars';
import { first, last, mapValues } from 'lodash';
import { useMemo } from 'react';

const SIGN_DEPENDENT_CHART_GRADIENT_IDS = {
  positive: 'positive',
  negative: 'negative',
} as const;

const SIGN_DEPENDENT_CHART_GRADIENT_URLS = mapValues(
  SIGN_DEPENDENT_CHART_GRADIENT_IDS,
  (id) => `url(#${id})`,
);

export const SIGN_DEPENDENT_CHART_DYNAMIC_GRADIENT_CONFIG = [
  {
    id: SIGN_DEPENDENT_CHART_GRADIENT_IDS.positive,
    stopColor: getTradeAppColorVar('positive'),
  },
  {
    id: SIGN_DEPENDENT_CHART_GRADIENT_IDS.negative,
    stopColor: getTradeAppColorVar('negative'),
  },
];

interface Params<TDataItem> {
  data?: TDataItem[];
  valueKey: ChartDataItemKey<TDataItem>;
}

/**
 * Get sign dependent colors for a chart based on the first and last data items.
 * If the last value is greater than or equal to the first value, it returns positive colors.
 * Otherwise, it returns negative colors.
 *
 * Note you'll need to add `SIGN_DEPENDENT_CHART_DYNAMIC_GRADIENT_CONFIG` to your chart's
 * ChartDynamicGradientDefinitions for the gradient to display correctly.
 *
 * @see ChartDynamicGradientDefinitions
 */
export function useChartSignDependentColors<TDataItem>({
  data,
  valueKey,
}: Params<TDataItem>) {
  return useMemo(() => {
    const startItemValue = first(data)?.[valueKey];
    const endItemValue = last(data)?.[valueKey];
    if (endItemValue == null || startItemValue == null) {
      return {
        fill: SIGN_DEPENDENT_CHART_GRADIENT_URLS.positive,
        stroke: getTradeAppColorVar('positive'),
      };
    }

    const isPositive = endItemValue >= startItemValue;
    return {
      fill: isPositive
        ? SIGN_DEPENDENT_CHART_GRADIENT_URLS.positive
        : SIGN_DEPENDENT_CHART_GRADIENT_URLS.negative,
      stroke: isPositive
        ? getTradeAppColorVar('positive')
        : getTradeAppColorVar('negative'),
    };
  }, [data, valueKey]);
}
