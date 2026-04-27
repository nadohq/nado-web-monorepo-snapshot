export interface MobileChartAPI {
  /**
   * Update the currently displayed product on the chart.
   */
  setProductId: (newProductId: number) => void;
}
