import { CsvDataItem, CsvFileName, downloadCsv } from '@nadohq/web-common';
import { StatsPieChartDataItem } from 'client/components/charts/StatsPieChart/types';
import { now } from 'lodash';

interface Params {
  data: StatsPieChartDataItem[] | undefined;
  dataName: string;
}

/**
 * Prepares and downloads CSV data for a Stats Pie Chart.
 *
 * This function processes the provided pie chart data to generate
 * a CSV file. The CSV will include columns for the name and value
 * of each data item. The filename is constructed using the provided
 * data name and the current timestamp.
 *
 * @param {Object} params - The parameters for exporting CSV data.
 * @param {StatsPieChartDataItem[] | undefined} params.data - The data to be exported.
 * @param {string} params.dataName - The base name for the CSV file.
 */
export function downloadStatsPieChartCsv({ data, dataName }: Params) {
  if (!data?.length) return;

  const headings = {
    name: 'Name',
    value: 'Value',
  };

  const rows = data.map(
    ({ name, value }): CsvDataItem => ({
      name,
      value: value.toString(),
    }),
  );

  // Generate the filename for the CSV file
  const filename: CsvFileName = `${dataName}_${now()}.csv`;

  downloadCsv(rows, filename, headings);
}
