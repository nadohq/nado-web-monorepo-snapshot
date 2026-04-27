import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { ChartTooltip } from 'client/components/ChartTooltip';
import {
  AREA_CHART_DEFAULTS,
  CHART_DOT_DEFAULTS,
  CHART_GRID_DEFAULTS,
  CHART_TOOLTIP_DEFAULTS,
  CHART_XAXIS_DEFAULTS,
} from 'client/modules/charts/config';
import { getTradeAppColorVar } from 'client/modules/theme/colorVars';
import {
  PortfolioChartTooltip,
  PortfolioChartTooltipBodyRenderFn,
} from 'client/pages/Portfolio/charts/components/PortfolioChartTooltip';
import { PORTFOLIO_CHART_GRADIENT_URLS } from 'client/pages/Portfolio/charts/consts';
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

function cumulativeTotalVolumeUsdDataKey(data: PortfolioChartDataItem) {
  return data.cumulativeTotalVolumeUsd;
}

export function PortfolioOverviewVolumeChart({
  data,
}: PortfolioChartComponentProps) {
  const { t } = useTranslation();
  const xAxisFormatter = usePortfolioChartXAxisFormatter();

  const renderTooltipBodyContent: PortfolioChartTooltipBodyRenderFn =
    useCallback(
      ({ cumulativeTotalVolumeUsd }: PortfolioChartDataItem) => {
        return (
          <ChartTooltip.Item
            title={t(($) => $.totalVolume)}
            content={formatNumber(cumulativeTotalVolumeUsd, {
              formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
            })}
          />
        );
      },
      [t],
    );

  return (
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
          dataKey={cumulativeTotalVolumeUsdDataKey}
          stroke={getTradeAppColorVar('accent-info')}
          fill={PORTFOLIO_CHART_GRADIENT_URLS.volume}
          activeDot={{
            ...CHART_DOT_DEFAULTS,
            stroke: getTradeAppColorVar('accent-info'),
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
