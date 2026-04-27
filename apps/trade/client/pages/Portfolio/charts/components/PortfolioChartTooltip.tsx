import { ChartTooltip } from 'client/components/ChartTooltip';
import { PortfolioChartDataItem } from 'client/pages/Portfolio/charts/types';
import { ReactNode } from 'react';
import { useActiveTooltipDataPoints } from 'recharts';

/** Given the datapoint of this tooltip, return the relevant body for the tooltip */
export type PortfolioChartTooltipBodyRenderFn = (
  payload: PortfolioChartDataItem,
) => ReactNode;

interface Props {
  renderBody: PortfolioChartTooltipBodyRenderFn;
}

export function PortfolioChartTooltip({ renderBody }: Props) {
  const data = useActiveTooltipDataPoints<PortfolioChartDataItem>();
  const item = data?.[0];
  if (!item) {
    return null;
  }

  return (
    <ChartTooltip.Container>
      <ChartTooltip.TimestampHeader timestampMillis={item.timestampMillis} />
      <ChartTooltip.Items>{renderBody(item)}</ChartTooltip.Items>
    </ChartTooltip.Container>
  );
}
