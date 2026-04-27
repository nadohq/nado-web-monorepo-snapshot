import { StatsChartDataItem } from 'client/components/charts/StatsChart/types';
import { getEdgeStatsColorVar } from 'client/theme/colorVars';
import { range } from 'lodash';
import { ComponentPropsWithoutRef } from 'react';
import {
  AreaProps,
  BarProps,
  CartesianGrid,
  LineProps,
  Rectangle,
  TooltipProps,
  XAxisProps,
  YAxisProps,
} from 'recharts';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

export const CHART_XAXIS_DEFAULTS: Omit<XAxisProps, 'ref'> = {
  dataKey: (data: StatsChartDataItem) => data.currentTimestampMillis,
  scale: 'time',
  domain: ['auto', 'auto'],
  // Time scale expects a numeric axis so we set type to number. Otherwise chart will not properly render.
  // See: https://github.com/recharts/recharts/issues/6577#issuecomment-3545302397
  type: 'number',
  minTickGap: 30,
  tick: {
    fontSize: 10,
    fontWeight: 500,
    color: getEdgeStatsColorVar('overlay-divider'),
  },
  axisLine: false,
  tickLine: false,
  stroke: getEdgeStatsColorVar('text-secondary'),
  tickMargin: 8,
  height: 20,
  tickCount: 10,
  // Add padding to prevent bars overflowing. Related to BAR_CHART_DEFAULTS maxBarSize.
  padding: { left: 5, right: 5 },
};

export const CHART_YAXIS_DEFAULTS: Omit<YAxisProps, 'ref'> = {
  tick: {
    fontSize: 10,
    fontWeight: 500,
    color: getEdgeStatsColorVar('overlay-divider'),
  },
  axisLine: false,
  tickLine: false,
  stroke: getEdgeStatsColorVar('text-secondary'),
  minTickGap: 25,
  width: 44,
  tickCount: 6,
  padding: { top: 10, bottom: 10 },
  scale: 'auto',
  domain: ['auto', 'auto'],
};

export const CHART_TOOLTIP_DEFAULTS: TooltipProps<ValueType, NameType> = {
  cursor: {
    stroke: getEdgeStatsColorVar('stroke'),
    strokeWidth: 1,
  },
};

export const CHART_GRID_DEFAULTS: ComponentPropsWithoutRef<
  typeof CartesianGrid
> = {
  stroke: getEdgeStatsColorVar('stroke'),
  // Removes first and last line of the grid.
  syncWithTicks: true,
  opacity: 0.6,
  vertical: false,
  // We increment every 10px to shape the grid correctly.
  verticalCoordinatesGenerator: (props) =>
    range(props.offset?.left ?? 0, props.width, 10),
};

const CHART_DOT_DEFAULTS: AreaProps['activeDot'] = {
  strokeWidth: 0.5,
  stroke: getEdgeStatsColorVar('text-tertiary'),
};

export const AREA_CHART_DEFAULTS: Omit<AreaProps, 'dataKey' | 'ref'> = {
  strokeWidth: 1,
  type: 'linear',
  fillOpacity: 0.2,
  strokeOpacity: 0.5,
  activeDot: CHART_DOT_DEFAULTS,
};

export const LINE_CHART_DEFAULTS: Omit<LineProps, 'dataKey' | 'ref'> = {
  strokeWidth: 2,
  type: 'linear',
  dot: false,
  strokeOpacity: 0.5,
  activeDot: CHART_DOT_DEFAULTS,
};

export const BAR_CHART_DEFAULTS: Omit<BarProps, 'dataKey' | 'ref'> = {
  // Add max bar size to prevent horizontal overflowing of the bars.
  // See: https://github.com/recharts/recharts/discussions/4701
  maxBarSize: 20,
  fillOpacity: 0.4,
  strokeOpacity: 0.1,
  activeBar: <Rectangle fillOpacity={0.8} strokeOpacity={0.1} />,
};
