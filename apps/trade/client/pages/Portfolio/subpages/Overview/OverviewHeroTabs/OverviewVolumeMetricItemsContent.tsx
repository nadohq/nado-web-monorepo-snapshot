import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useSubaccountTimespanMetrics } from 'client/hooks/subaccount/useSubaccountTimespanMetrics';
import { getTimespanMetadata } from 'client/modules/charts/utils/timespan';
import { usePrivacySetting } from 'client/modules/privacy/hooks/usePrivacySetting';
import { PortfolioOverviewVolumeChart } from 'client/pages/Portfolio/subpages/Overview/charts/PortfolioOverviewVolumeChart';
import { usePortfolioChartData } from 'client/pages/Portfolio/subpages/Overview/charts/usePortfolioChartData';
import { OverviewTabContent } from 'client/pages/Portfolio/subpages/Overview/OverviewHeroTabs/components/OverviewTabContent';
import { portfolioTimespanAtom } from 'client/store/portfolioStore';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function OverviewVolumeMetricItemsContent() {
  const { t } = useTranslation();
  const timespan = useAtomValue(portfolioTimespanAtom);
  const [areAccountValuesPrivate] = usePrivacySetting(
    'areAccountValuesPrivate',
  );
  const { label: timespanLabel, timespanInSeconds } = getTimespanMetadata(
    t,
    timespan,
  );
  const { data: chartData } = usePortfolioChartData(timespan);
  const { data: volumeMetricsData } =
    useSubaccountTimespanMetrics(timespanInSeconds);

  const metricsContent = useMemo(
    () => (
      <>
        <span className="text-text-secondary text-sm font-medium">
          {t(($) => $.timespanTotals, { timespan: timespanLabel })}
        </span>
        <ValueWithLabel.Horizontal
          tooltip={{ id: 'overviewTimespanVolume' }}
          isValuePrivate={areAccountValuesPrivate}
          sizeVariant="sm"
          label={t(($) => $.volume)}
          value={volumeMetricsData?.deltas.cumulativeTotalVolumeUsd}
          numberFormatSpecifier={PresetNumberFormatSpecifier.CURRENCY_2DP}
        />
        <ValueWithLabel.Horizontal
          tooltip={{ id: 'overviewTimespanPerpVolume' }}
          isValuePrivate={areAccountValuesPrivate}
          sizeVariant="sm"
          label={t(($) => $.perpVolume)}
          value={volumeMetricsData?.deltas.cumulativePerpVolumeUsd}
          numberFormatSpecifier={PresetNumberFormatSpecifier.CURRENCY_2DP}
        />
        <ValueWithLabel.Horizontal
          tooltip={{ id: 'overviewTimespanSpotVolume' }}
          isValuePrivate={areAccountValuesPrivate}
          sizeVariant="sm"
          label={t(($) => $.spotVolume)}
          value={volumeMetricsData?.deltas.cumulativeSpotVolumeUsd}
          numberFormatSpecifier={PresetNumberFormatSpecifier.CURRENCY_2DP}
        />
      </>
    ),
    [areAccountValuesPrivate, t, timespanLabel, volumeMetricsData],
  );

  return (
    <OverviewTabContent
      metricsContent={metricsContent}
      ChartComponent={PortfolioOverviewVolumeChart}
      chartData={chartData}
      isPrivate={areAccountValuesPrivate}
    />
  );
}
