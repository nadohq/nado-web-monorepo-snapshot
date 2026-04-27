import { WithClassnames } from '@nadohq/web-common';
import { StatsDataCard } from 'client/components/StatsDataCard';
import { StatsChartTooltip } from 'client/components/charts/StatsChart/StatsChartTooltip';
import {
  AREA_CHART_DEFAULTS,
  BAR_CHART_DEFAULTS,
  CHART_GRID_DEFAULTS,
  CHART_XAXIS_DEFAULTS,
  CHART_YAXIS_DEFAULTS,
  LINE_CHART_DEFAULTS,
} from 'client/components/charts/StatsChart/config';
import { downloadStatsChartCsv } from 'client/components/charts/StatsChart/downloadStatsChartCsv';
import {
  StatsChartConfig,
  StatsChartConfigByDataKey,
  StatsChartDataItem,
  StatsYAxisID,
} from 'client/components/charts/StatsChart/types';
import { getDefaultChartFillColor } from 'client/components/charts/utils/getDefaultChartFillColor';
import { snakeCase } from 'lodash';
import { ReactNode, useMemo } from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  Tooltip as ReChartsTooltip,
  ResponsiveContainer,
  XAxis,
  XAxisProps,
  YAxis,
  YAxisProps,
} from 'recharts';
import { StackOffsetType } from 'recharts/types/util/types';

interface Props<TDataKey extends string> extends WithClassnames {
  chartTitle: string;
  chartDescription: string;
  headerSelectComponent?: ReactNode;
  data: StatsChartDataItem<TDataKey>[] | undefined;
  configByDataKey: StatsChartConfigByDataKey<TDataKey>;
  xAxisProps: Omit<XAxisProps, 'ref'>;
  yAxisProps: Omit<YAxisProps, 'ref'>;
  /** Set to `true` if we have `right` yAxisId in configByDataKey and we want to show it. */
  shouldShowRightYAxis?: boolean;
  /**
   * Determines how bar values are stacked.
   * See: https://recharts.org/en-US/api/BarChart#stackOffset
   */
  barChartStackOffset?: StackOffsetType;
  isLoading: boolean;
}

export function StatsChart<TDataKey extends string>({
  chartTitle,
  chartDescription,
  data,
  configByDataKey,
  headerSelectComponent,
  xAxisProps,
  yAxisProps,
  isLoading,
  shouldShowRightYAxis,
  barChartStackOffset,
  className,
}: Props<TDataKey>) {
  const configByDataKeyValues = useMemo(
    () => Object.values(configByDataKey) as StatsChartConfig<TDataKey>[],
    [configByDataKey],
  );

  const isDownloadCsvDisabled = !data?.length || isLoading;

  const handleDownloadCsv = () => {
    downloadStatsChartCsv({
      data,
      dataName: snakeCase(chartTitle),
      configByDataKeyValues,
    });
  };

  return (
    <StatsDataCard
      className={className}
      title={chartTitle}
      description={chartDescription}
      headerSelectComponent={headerSelectComponent}
      data={data}
      isLoading={isLoading}
      downloadCsv={{
        onDownload: handleDownloadCsv,
        isDisabled: isDownloadCsvDisabled,
      }}
    >
      <ResponsiveContainer>
        <ComposedChart
          data={data}
          // reverse stack order so it matches with tooltip order more closely.
          reverseStackOrder
          stackOffset={barChartStackOffset}
        >
          <CartesianGrid {...CHART_GRID_DEFAULTS} />
          <ReChartsTooltip
            content={
              <StatsChartTooltip
                valueFormatter={yAxisProps.tickFormatter}
                configByDataKey={configByDataKey}
                data={data}
              />
            }
          />
          <XAxis {...CHART_XAXIS_DEFAULTS} {...xAxisProps} />
          <YAxis
            {...CHART_YAXIS_DEFAULTS}
            yAxisId={'left' satisfies StatsYAxisID}
            {...yAxisProps}
          />
          <YAxis
            {...CHART_YAXIS_DEFAULTS}
            hide={!shouldShowRightYAxis}
            yAxisId={'right' satisfies StatsYAxisID}
            orientation="right"
            {...yAxisProps}
          />
          {configByDataKeyValues.map(
            (
              {
                dataKey,
                stackId: stackIdOverride,
                color: colorOverride,
                chartType,
                yAxisId,
                showOnTooltipOnly,
              },
              index,
            ) => {
              const color = getDefaultChartFillColor(
                colorOverride,
                index,
                configByDataKeyValues.length,
              );

              const stackId = (() => {
                // If `stackIdOverride` is explicitly set to `null`, stacking is disabled (stackId is set to `undefined`).
                if (stackIdOverride === null) {
                  return;
                }

                // If `stackIdOverride` is defined, it is used as the `stackId` for the area or bars.
                // Otherwise, if `stackIdOverride` is `undefined`, the default stack (`defaultStack`) is used, making chart areas or bars to share the same stack.
                return stackIdOverride ?? 'defaultStack';
              })();

              const commonChartProps = {
                stroke: color,
                fill: color,
                hide: showOnTooltipOnly,
                // Fallback to null if the dataKey is not present in the data.
                // As undefined can cause the chart to render unexpected elements,
                // such as non-existent bars, lines...
                dataKey: ({ data }: StatsChartDataItem) =>
                  data[dataKey] ?? null,
              };

              return {
                bar: (
                  <Bar
                    key={dataKey}
                    {...commonChartProps}
                    {...BAR_CHART_DEFAULTS}
                    yAxisId={yAxisId}
                    stackId={stackId}
                  />
                ),
                area: (
                  <Area
                    key={dataKey}
                    {...AREA_CHART_DEFAULTS}
                    {...commonChartProps}
                    yAxisId={yAxisId}
                    stackId={stackId}
                  />
                ),
                line: (
                  <Line
                    key={dataKey}
                    {...LINE_CHART_DEFAULTS}
                    {...commonChartProps}
                    yAxisId={yAxisId}
                  />
                ),
              }[chartType];
            },
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </StatsDataCard>
  );
}
