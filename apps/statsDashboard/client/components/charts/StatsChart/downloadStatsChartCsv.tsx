import { CsvFileName, downloadCsv } from '@nadohq/web-common';
import {
  StatsChartConfig,
  StatsChartDataItem,
} from 'client/components/charts/StatsChart/types';
import { first, last, mapValues, startCase } from 'lodash';

function formatChartRow(row: StatsChartDataItem): Record<string, string> {
  return {
    ...mapValues(row.data, (value) => value?.toString()),
    currentTimestampMillis: new Date(row.currentTimestampMillis).toISOString(),
  };
}

function generateCsvHeadings<TDataKey extends string>(
  config: StatsChartConfig<TDataKey>[],
  data: StatsChartDataItem<TDataKey>[],
) {
  // Get all data keys. We can assume that all data items have the same keys.
  const dataKeys = Object.keys(first(data)?.data ?? {});

  // Filter config to only include data keys that exist in the data.
  const configWithFilteredDataKeys = config.filter(({ dataKey }) =>
    dataKeys.includes(dataKey),
  );

  return configWithFilteredDataKeys.reduce(
    (acc, { dataKey }) => ({
      ...acc,
      // Use startCase to format the dataKey for better readability in the CSV.
      [dataKey]: startCase(dataKey),
    }),
    {
      // Add timestamp heading to the CSV headings.
      currentTimestampMillis: 'Timestamp',
    },
  );
}

interface Params<TDataKey extends string> {
  data: StatsChartDataItem<TDataKey>[] | undefined;
  dataName: string;
  configByDataKeyValues: StatsChartConfig<TDataKey>[];
}

/**
 * Prepares and downloads CSV data for a Stats Chart.
 *
 * This function processes the provided chart data to generate
 * a CSV file. The CSV will include columns for each data key
 * specified in the configuration, as well as a timestamp column.
 * The filename is constructed using the provided data name and
 * the start and end timestamps of the data.
 *
 * @param {Object} params - The parameters for exporting CSV data.
 * @param {StatsChartDataItem<TDataKey>[] | undefined} params.data - The data to be exported.
 * @param {string} params.dataName - The base name for the CSV file.
 * @param {StatsChartConfig<TDataKey>[]} params.configByDataKeyValues - The configuration for the data keys.
 */
export function downloadStatsChartCsv<TDataKey extends string>({
  data,
  dataName,
  configByDataKeyValues,
}: Params<TDataKey>) {
  if (!data?.length) return;

  const endTimeMillis = last(data)?.currentTimestampMillis;
  const startTimeMillis = first(data)?.earlierTimestampMillis;

  // If either timestamp is missing, do not proceed with CSV export.
  // This shouldn't happen. But here for type safety.
  if (startTimeMillis == null || endTimeMillis == null) return;

  // Generate column headings from config and timestamp keys.
  const headings = generateCsvHeadings(configByDataKeyValues, data);

  // Flatten and format chart data rows for CSV export.
  const rows = data.map(formatChartRow);

  // Construct a unique CSV filename.
  const filename: CsvFileName = `${dataName}_${startTimeMillis}_${endTimeMillis}.csv`;

  // Trigger the CSV download.
  downloadCsv(rows, filename, headings);
}
