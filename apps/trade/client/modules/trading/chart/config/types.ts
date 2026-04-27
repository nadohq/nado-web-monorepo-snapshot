import { ChartingLibraryWidgetOptions } from 'public/charting_library';

export interface WidgetConfig {
  // Custom css properties -> colors
  styling: Record<string, string>;
  // Specific options for the chart
  options: Omit<ChartingLibraryWidgetOptions, 'datafeed'>;
}
