import { ChartTooltip } from 'client/components/ChartTooltip';
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
} from 'client/modules/charts/config';
import {
  PortfolioChartTooltip,
  PortfolioChartTooltipBodyRenderFn,
} from 'client/pages/Portfolio/charts/components/PortfolioChartTooltip';
import { SignedCurrencyChangeMetric } from 'client/pages/Portfolio/charts/components/SignedCurrencyChangeMetric';
import { usePortfolioChartXAxisFormatter } from 'client/pages/Portfolio/charts/hooks/usePortfolioChartXAxisFormatter';
import {
  PortfolioChartComponentProps,
  PortfolioChartDataItem,
} from 'client/pages/Portfolio/charts/types';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';

function cumulativePnlDataKey(data: PortfolioChartDataItem) {
  return data.cumulativeAccountPnlUsd;
}

export function PortfolioOverviewPnlChart({
  data,
}: PortfolioChartComponentProps) {
  const { t } = useTranslation();

  const xAxisFormatter = usePortfolioChartXAxisFormatter();
  const pnlChartColors = useChartSignDependentColors({
    data,
    valueKey: 'cumulativeAccountPnlUsd',
  });

  const renderTooltipBodyContent: PortfolioChartTooltipBodyRenderFn =
    useCallback(
      ({ cumulativeAccountPnlUsd }: PortfolioChartDataItem) => {
        return (
          <ChartTooltip.Item
            title={t(($) => $.cumulativePnl)}
            content={
              <SignedCurrencyChangeMetric value={cumulativeAccountPnlUsd} />
            }
          />
        );
      },
      [t],
    );

  return (
    <>
      {/* Gradient definitions component needs to be wrapped in a fragment here
        so we can pass in `data` to determine the gradient stop offset */}
      <ChartDynamicGradientDefinitions
        valueKey="cumulativeAccountPnlUsd"
        gradientConfigs={SIGN_DEPENDENT_CHART_DYNAMIC_GRADIENT_CONFIG}
        data={data}
      />
      <ResponsiveContainer>
        <AreaChart data={data}>
          <CartesianGrid {...CHART_GRID_DEFAULTS} />
          <Tooltip
            {...CHART_TOOLTIP_DEFAULTS}
            content={
              <PortfolioChartTooltip renderBody={renderTooltipBodyContent} />
            }
          />
          <XAxis {...CHART_XAXIS_DEFAULTS} tickFormatter={xAxisFormatter} />
          <Area
            {...AREA_CHART_DEFAULTS}
            {...pnlChartColors}
            dataKey={cumulativePnlDataKey}
            activeDot={{
              ...CHART_DOT_DEFAULTS,
              stroke: pnlChartColors.stroke,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
}
