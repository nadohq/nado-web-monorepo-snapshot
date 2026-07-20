import { TradingTerminalWidgetOptions } from 'public/charting_library';

export interface WidgetConfig {
  // Specific options for the chart
  options: Omit<TradingTerminalWidgetOptions, 'datafeed'>;
}
