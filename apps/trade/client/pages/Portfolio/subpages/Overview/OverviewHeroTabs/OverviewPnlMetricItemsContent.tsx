import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useSubaccountOverview } from 'client/hooks/subaccount/useSubaccountOverview/useSubaccountOverview';
import { useSubaccountTimespanMetrics } from 'client/hooks/subaccount/useSubaccountTimespanMetrics';
import { getTimespanMetadata } from 'client/modules/charts/utils/timespan';
import { usePrivacySetting } from 'client/modules/privacy/hooks/usePrivacySetting';
import { PortfolioOverviewPnlChart } from 'client/pages/Portfolio/subpages/Overview/charts/PortfolioOverviewPnlChart';
import { usePortfolioChartData } from 'client/pages/Portfolio/subpages/Overview/charts/usePortfolioChartData';
import { OverviewTabContent } from 'client/pages/Portfolio/subpages/Overview/OverviewHeroTabs/components/OverviewTabContent';
import { portfolioTimespanAtom } from 'client/store/portfolioStore';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

export function OverviewPnlMetricItemsContent() {
  const { t } = useTranslation();
  const timespan = useAtomValue(portfolioTimespanAtom);
  const { timespanInSeconds, label: timespanLabel } = getTimespanMetadata(
    t,
    timespan,
  );
  const [areAccountValuesPrivate] = usePrivacySetting(
    'areAccountValuesPrivate',
  );
  const { data: chartData } = usePortfolioChartData(timespan);
  const { data: subaccountOverview } = useSubaccountOverview();
  const { data: subaccountTimespanMetrics } =
    useSubaccountTimespanMetrics(timespanInSeconds);

  const totalCrossUnrealizedPnlUsd =
    subaccountOverview?.spot.totalUnrealizedPnlUsd.plus(
      subaccountOverview?.perp.cross.totalUnrealizedPnlUsd,
    );

  const metricsContent = (
    <>
      <ValueWithLabel.Horizontal
        tooltip={{ id: 'overviewAccountCumulativePnl' }}
        isValuePrivate={areAccountValuesPrivate}
        sizeVariant="sm"
        valueClassName={getSignDependentColorClassName(
          subaccountTimespanMetrics?.deltas.cumulativeAccountPnlUsd,
        )}
        label={t(($) => $.timespanAccountPnl, { timespan: timespanLabel })}
        value={subaccountTimespanMetrics?.deltas.cumulativeAccountPnlUsd}
        numberFormatSpecifier={PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP}
      />
      <ValueWithLabel.Horizontal
        tooltip={{ id: 'overviewTotalUnrealizedPnl' }}
        isValuePrivate={areAccountValuesPrivate}
        sizeVariant="sm"
        valueClassName={getSignDependentColorClassName(
          subaccountOverview?.totalUnrealizedPnlUsd,
        )}
        label={t(($) => $.unrealizedPnl)}
        value={subaccountOverview?.totalUnrealizedPnlUsd}
        numberFormatSpecifier={PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP}
      />
      <ValueWithLabel.Horizontal
        tooltip={{ id: 'overviewCrossUnrealizedPnl' }}
        isValuePrivate={areAccountValuesPrivate}
        sizeVariant="sm"
        valueClassName={getSignDependentColorClassName(
          totalCrossUnrealizedPnlUsd,
        )}
        label={t(($) => $.crossAccountUnrealizedPnl)}
        value={totalCrossUnrealizedPnlUsd}
        numberFormatSpecifier={PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP}
      />
      <ValueWithLabel.Horizontal
        tooltip={{ id: 'overviewIsoUnrealizedPnl' }}
        isValuePrivate={areAccountValuesPrivate}
        sizeVariant="sm"
        valueClassName={getSignDependentColorClassName(
          subaccountOverview?.perp.iso.totalUnrealizedPnlUsd,
        )}
        label={t(($) => $.isoUnrealizedPnl)}
        value={subaccountOverview?.perp.iso.totalUnrealizedPnlUsd}
        numberFormatSpecifier={PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP}
      />
    </>
  );

  return (
    <OverviewTabContent
      metricsContent={metricsContent}
      ChartComponent={PortfolioOverviewPnlChart}
      chartData={chartData}
      isPrivate={areAccountValuesPrivate}
    />
  );
}
