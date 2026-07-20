import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useSubaccountOverview } from 'client/hooks/subaccount/useSubaccountOverview/useSubaccountOverview';
import { usePrivacyMode } from 'client/modules/privacy/hooks/usePrivacyMode';
import { PortfolioOverviewAccountEquityChart } from 'client/pages/Portfolio/subpages/Overview/charts/PortfolioOverviewAccountEquityChart';
import { usePortfolioChartData } from 'client/pages/Portfolio/subpages/Overview/charts/usePortfolioChartData';
import { OverviewMaintMarginUsage } from 'client/pages/Portfolio/subpages/Overview/OverviewHeroTabs/components/OverviewMaintMarginUsage';
import { OverviewTabContent } from 'client/pages/Portfolio/subpages/Overview/OverviewHeroTabs/components/OverviewTabContent';
import { portfolioTimespanAtom } from 'client/store/portfolioStore';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

export function OverviewAccountMetricItemsContent() {
  const { t } = useTranslation();

  const { data: subaccountOverview } = useSubaccountOverview();
  const timespan = useAtomValue(portfolioTimespanAtom);
  const { isPrivacyModeEnabled } = usePrivacyMode();
  const { data: chartData } = usePortfolioChartData(timespan);

  const metricsContent = (
    <>
      <ValueWithLabel.Horizontal
        tooltip={{ id: 'overviewAccountSpotBalance' }}
        isValuePrivate={isPrivacyModeEnabled}
        sizeVariant="sm"
        label={t(($) => $.balance)}
        value={subaccountOverview?.spot.netTotalBalanceUsd}
        numberFormatSpecifier={PresetNumberFormatSpecifier.CURRENCY_2DP}
      />
      <ValueWithLabel.Horizontal
        isValuePrivate={isPrivacyModeEnabled}
        sizeVariant="sm"
        label={t(($) => $.unrealizedPerpPnl)}
        value={subaccountOverview?.perp.totalUnrealizedPnlUsd}
        valueClassName={getSignDependentColorClassName(
          subaccountOverview?.perp.totalUnrealizedPnlUsd,
        )}
        numberFormatSpecifier={PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP}
      />
      <ValueWithLabel.Horizontal
        isValuePrivate={isPrivacyModeEnabled}
        sizeVariant="sm"
        label={t(($) => $.unrealizedSpotPnl)}
        value={subaccountOverview?.spot.totalUnrealizedPnlUsd}
        valueClassName={getSignDependentColorClassName(
          subaccountOverview?.spot.totalUnrealizedPnlUsd,
        )}
        numberFormatSpecifier={PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP}
      />
      <ValueWithLabel.Horizontal
        tooltip={{ id: 'availableMarginUsd' }}
        isValuePrivate={isPrivacyModeEnabled}
        sizeVariant="sm"
        label={t(($) => $.availableMargin)}
        value={subaccountOverview?.initialMarginBoundedUsd}
        numberFormatSpecifier={PresetNumberFormatSpecifier.CURRENCY_2DP}
      />
      <ValueWithLabel.Horizontal
        tooltip={{ id: 'maintMarginRatio' }}
        isValuePrivate={isPrivacyModeEnabled}
        sizeVariant="sm"
        label={t(($) => $.maintenanceMarginAndRatio)}
        valueContent={
          <OverviewMaintMarginUsage
            maintMarginBoundedUsd={subaccountOverview?.maintMarginBoundedUsd}
            maintMarginUsageFraction={
              subaccountOverview?.maintMarginUsageFractionBounded
            }
          />
        }
      />
    </>
  );

  return (
    <OverviewTabContent
      metricsContent={metricsContent}
      ChartComponent={PortfolioOverviewAccountEquityChart}
      chartData={chartData}
      isPrivate={isPrivacyModeEnabled}
    />
  );
}
