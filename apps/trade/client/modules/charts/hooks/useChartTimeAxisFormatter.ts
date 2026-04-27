import { ChartTimespan } from 'client/modules/charts/types';
import {
  dateAxisFormatter,
  dateWithDayAxisFormatter,
  dateWithYearAxisFormatter,
  timeAxisFormatter,
} from 'client/modules/charts/utils/axisFormatters';

export function useChartTimeAxisFormatter(
  timespan: ChartTimespan,
): (value: number) => string {
  switch (timespan) {
    case '24h':
      return timeAxisFormatter;
    case '7d':
      return dateAxisFormatter;
    case '30d':
      return dateWithDayAxisFormatter;
    case 'all_time':
      return dateWithYearAxisFormatter;
  }
}
