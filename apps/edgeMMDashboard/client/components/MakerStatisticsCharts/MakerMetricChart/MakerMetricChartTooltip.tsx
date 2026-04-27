import { truncateAddress } from '@nadohq/react-client';
import { ChartTooltip } from 'client/components/MakerStatisticsCharts/MakerMetricChart/ChartTooltip';
import { MakerMetricChartDataItem } from 'client/components/MakerStatisticsCharts/MakerMetricChart/types';
import { getHexColorForAddress } from 'client/components/MakerStatisticsCharts/MakerMetricChart/utils';
import { useActiveTooltipDataPoints } from 'recharts';

interface Props {
  labelFormatter:
    | ((value: number | undefined, index: number) => string)
    | undefined;
  hiddenAddresses: Record<string, boolean>;
}

export function MakerMetricChartTooltip({
  labelFormatter,
  hiddenAddresses,
}: Props) {
  const data = useActiveTooltipDataPoints<MakerMetricChartDataItem>();
  const item = data?.[0];
  if (!item) {
    return null;
  }

  const { timestampMillis, ...rest } = item;

  return (
    <ChartTooltip.Container>
      <ChartTooltip.TimestampHeader timestampMillis={timestampMillis} />
      <ChartTooltip.Items>
        {Object.entries(rest).map(([address, value], index) => {
          // Skip rendering hidden addresses in tooltip
          if (hiddenAddresses?.[address] === true) {
            return null;
          }

          const title = truncateAddress(address);
          const legendColor = getHexColorForAddress(address);

          return (
            <ChartTooltip.Item
              key={address}
              title={title}
              legendColor={legendColor}
              content={labelFormatter?.(value, index) ?? value}
            />
          );
        })}
      </ChartTooltip.Items>
    </ChartTooltip.Container>
  );
}
