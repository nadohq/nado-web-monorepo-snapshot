import { ALL_CHART_TIMESPANS } from 'client/modules/charts/consts';

export type ChartTimespan = (typeof ALL_CHART_TIMESPANS)[number];

export type ChartDataItemKey<ChartDataItem> = {
  // Iterates over the keys of ChartDataItem and checks if the value type is a number or undefined.
  // If true, it keeps the key; otherwise, it assigns `never`, effectively filtering out non-numeric keys.
  [K in keyof ChartDataItem]: ChartDataItem[K] extends number | undefined
    ? K
    : never;
}[keyof ChartDataItem]; // Extracts only the numeric keys from TChartDataItem.
