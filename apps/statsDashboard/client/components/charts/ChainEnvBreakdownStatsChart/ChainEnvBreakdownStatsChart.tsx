import { WithClassnames } from '@nadohq/web-common';
import { ChainEnvBreakdownStatsChartDataItem } from 'client/components/charts/ChainEnvBreakdownStatsChart/types';
import { StatsChart } from 'client/components/charts/StatsChart/StatsChart';
import {
  StatsChartConfigByDataKey,
  StatsChartDataItem,
} from 'client/components/charts/StatsChart/types';
import { getEdgeStatsColorVar } from 'client/theme/colorVars';
import { useMemo } from 'react';
import { XAxisProps, YAxisProps } from 'recharts';

type EdgeOnlyDataKey = 'value' | 'cumulative';

interface Props extends WithClassnames {
  chartTitle: string;
  chartDescription: string;
  data: ChainEnvBreakdownStatsChartDataItem[] | undefined;
  xAxisProps: Omit<XAxisProps, 'ref'>;
  yAxisProps: Omit<YAxisProps, 'ref'>;
  isLoading: boolean;
  chartType: 'bar' | 'area';
  /** If we don't have data for `edgeCumulative` in data. Set to `true` to hide right y axis. */
  hideEdgeCumulativeYAxis?: boolean;
}

/**
 * Renders a chart showing aggregated Edge totals and cumulative line.
 *
 * Per-chain-env breakdown is not shown because we currently only have
 * aggregated Edge data — individual chain env values are not available.
 */
export function ChainEnvBreakdownStatsChart({
  chartTitle,
  chartDescription,
  data,
  xAxisProps,
  yAxisProps,
  isLoading,
  className,
  chartType,
  hideEdgeCumulativeYAxis,
}: Props) {
  const edgeOnlyData: StatsChartDataItem<EdgeOnlyDataKey>[] | undefined =
    useMemo(() => {
      return data?.map((item) => ({
        currentTimestampMillis: item.currentTimestampMillis,
        earlierTimestampMillis: item.earlierTimestampMillis,
        data: {
          value: item.data.edge,
          cumulative: item.data.edgeCumulative,
        },
      }));
    }, [data]);

  const configByDataKey: StatsChartConfigByDataKey<EdgeOnlyDataKey> = useMemo(
    () => ({
      value: {
        dataKey: 'value',
        label: chartTitle,
        chartType,
        yAxisId: 'left',
      },
      cumulative: {
        color: getEdgeStatsColorVar('chart-fill'),
        hasTooltipTopDivider: true,
        label: 'Cumulative',
        dataKey: 'cumulative',
        chartType: 'line',
        yAxisId: 'right',
      },
    }),
    [chartType, chartTitle],
  );

  return (
    <StatsChart
      className={className}
      chartTitle={chartTitle}
      chartDescription={chartDescription}
      isLoading={isLoading}
      xAxisProps={xAxisProps}
      yAxisProps={yAxisProps}
      shouldShowRightYAxis={!hideEdgeCumulativeYAxis}
      data={edgeOnlyData}
      configByDataKey={configByDataKey}
    />
  );
}
