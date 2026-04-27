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
import { getTradeAppColorVar } from 'client/modules/theme/colorVars';
import { NlpPerformanceTvlChartTooltip } from 'client/pages/Vault/components/NlpOverviewCard/components/charts/NlpPerformanceTvlChartTooltip';
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

const TVL_GRADIENT_ID = 'tvl';
const TVL_GRADIENT_URL = `url(#${TVL_GRADIENT_ID})`;

function tvlUsdDataKey(data: NlpPerformanceChartDataItem) {
  return data.tvlUsd;
}

interface Props {
  chartData: NlpPerformanceChartDataItem[] | undefined;
  timespan: ChartTimespan;
}

export function NlpPerformanceTvlChart({ chartData: data, timespan }: Props) {
  const timeAxisFormatter = useChartTimeAxisFormatter(timespan);

  return (
    <>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id={TVL_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={getTradeAppColorVar('accent')} />
            <stop
              offset="100%"
              stopColor={getTradeAppColorVar('grad-chart-stop')}
            />
          </linearGradient>
        </defs>
      </svg>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <CartesianGrid {...CHART_GRID_DEFAULTS} />
          <Tooltip
            {...CHART_TOOLTIP_DEFAULTS}
            content={<NlpPerformanceTvlChartTooltip />}
          />
          <XAxis {...CHART_XAXIS_DEFAULTS} tickFormatter={timeAxisFormatter} />
          <YAxis
            {...CHART_YAXIS_DEFAULTS}
            tickFormatter={currencyAxisFormatter}
          />
          <Area
            {...AREA_CHART_DEFAULTS}
            dataKey={tvlUsdDataKey}
            stroke={getTradeAppColorVar('accent')}
            fill={TVL_GRADIENT_URL}
            activeDot={{
              ...CHART_DOT_DEFAULTS,
              stroke: getTradeAppColorVar('accent'),
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
}
