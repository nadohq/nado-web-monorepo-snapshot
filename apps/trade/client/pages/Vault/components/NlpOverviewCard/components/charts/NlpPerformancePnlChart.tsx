import { ChartDynamicGradientDefinitions } from 'client/modules/charts/components/ChartDynamicGradientDefinitions/ChartDynamicGradientDefinitions';
import {
  SIGN_DEPENDENT_CHART_DYNAMIC_GRADIENT_CONFIG,
  useChartSignDependentColors,
} from 'client/modules/charts/components/ChartDynamicGradientDefinitions/useChartSignDependentColors';
import {
  AREA_CHART_DEFAULTS,
  CHART_DOT_DEFAULTS,
  CHART_GRID_DEFAULTS,
  CHART_TOOLTIP_DEFAULTS,
  CHART_XAXIS_DEFAULTS,
  CHART_YAXIS_DEFAULTS,
} from 'client/modules/charts/config';
import { useChartTimeAxisFormatter } from 'client/modules/charts/hooks/useChartTimeAxisFormatter';
import { ChartTimespan } from 'client/modules/charts/types';
import { currencyAxisFormatter } from 'client/modules/charts/utils/axisFormatters';
import { NlpPerformancePnlChartTooltip } from 'client/pages/Vault/components/NlpOverviewCard/components/charts/NlpPerformancePnlChartTooltip';
import { NlpPerformanceChartDataItem } from 'client/pages/Vault/components/NlpOverviewCard/components/charts/types';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function cumulativePnlUsdDataKey(data: NlpPerformanceChartDataItem) {
  return data.cumulativePnlUsd;
}

interface Props {
  chartData: NlpPerformanceChartDataItem[] | undefined;
  timespan: ChartTimespan;
}

export function NlpPerformancePnlChart({ chartData: data, timespan }: Props) {
  const timeAxisFormatter = useChartTimeAxisFormatter(timespan);
  const chartColors = useChartSignDependentColors({
    data,
    valueKey: 'cumulativePnlUsd',
  });

  return (
    <>
      <ChartDynamicGradientDefinitions
        valueKey={'cumulativePnlUsd'}
        data={data}
        gradientConfigs={SIGN_DEPENDENT_CHART_DYNAMIC_GRADIENT_CONFIG}
      />
      <ResponsiveContainer>
        <AreaChart data={data}>
          <CartesianGrid {...CHART_GRID_DEFAULTS} />
          <Tooltip
            {...CHART_TOOLTIP_DEFAULTS}
            content={<NlpPerformancePnlChartTooltip />}
          />
          <XAxis {...CHART_XAXIS_DEFAULTS} tickFormatter={timeAxisFormatter} />
          <YAxis
            {...CHART_YAXIS_DEFAULTS}
            tickFormatter={currencyAxisFormatter}
          />
          <Area
            {...AREA_CHART_DEFAULTS}
            {...chartColors}
            dataKey={cumulativePnlUsdDataKey}
            activeDot={{
              ...CHART_DOT_DEFAULTS,
              stroke: chartColors.stroke,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
}
