import type { Bar } from 'public/charting_library';

export interface BarSubscriber {
  productId: number;
  chartIntervalSeconds: number;
  subscribeUID: string;

  updateLatestBar(bar: Bar): void;
}
