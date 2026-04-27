import { formatNumber, NumberFormatSpecifier } from '@nadohq/react-client';
import { ChartTooltip } from 'client/components/charts/ChartTooltip';
import { StatsPieChartDataItem } from 'client/components/charts/StatsPieChart/types';
import { useActiveTooltipDataPoints } from 'recharts';

interface Props {
  formatSpecifier: NumberFormatSpecifier;
}

export function StatsPieChartTooltip({ formatSpecifier }: Props) {
  const data = useActiveTooltipDataPoints<
    StatsPieChartDataItem & { fill: string }
  >();
  const item = data?.[0];
  if (!item) {
    return null;
  }

  const { name, value, fill } = item;

  return (
    <ChartTooltip.Container>
      <ChartTooltip.Row>
        <ChartTooltip.RowLabel legendColor={fill} label={name} />
        {formatNumber(value, { formatSpecifier })}
      </ChartTooltip.Row>
    </ChartTooltip.Container>
  );
}
