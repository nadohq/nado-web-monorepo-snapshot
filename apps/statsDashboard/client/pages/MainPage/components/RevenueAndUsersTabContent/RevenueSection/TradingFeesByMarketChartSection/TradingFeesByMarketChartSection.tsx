import { CustomNumberFormatSpecifier } from '@nadohq/react-client';
import { StatsPieChart } from 'client/components/charts/StatsPieChart/StatsPieChart';
import { StatsChartWithOverviewSection } from 'client/components/StatsChartWithOverviewSection';
import { StatsValueWithLabel } from 'client/components/StatsValueWithLabel';
import { useEdgeMakerRebatesOverviewData } from 'client/pages/MainPage/components/RevenueAndUsersTabContent/RevenueSection/TradingFeesByMarketChartSection/useEdgeMakerRebatesOverviewData';
import { useEdgeTradingFeesPieChartData } from 'client/pages/MainPage/components/RevenueAndUsersTabContent/RevenueSection/TradingFeesByMarketChartSection/useEdgeTradingFeesPieChartData';

export function TradingFeesByMarketChartSection() {
  const { data: edgeMarketRebatesOverviewData } =
    useEdgeMakerRebatesOverviewData();
  const {
    data: edgeTradingFeesPieChartData,
    isLoading: isLoadingEdgeTradingFeesPieChartData,
  } = useEdgeTradingFeesPieChartData();

  return (
    <StatsChartWithOverviewSection
      overviewContent={
        <StatsValueWithLabel
          label="Total Maker Rebates"
          value={edgeMarketRebatesOverviewData?.edgeTotalMakerRebatesUsd}
          formatSpecifier={
            CustomNumberFormatSpecifier.CURRENCY_LARGE_ABBREVIATED
          }
        />
      }
    >
      <StatsPieChart
        chartTitle="Fees by Market"
        chartDescription="Breakdown of cumulative trading fees across individual markets."
        isLoading={isLoadingEdgeTradingFeesPieChartData}
        data={edgeTradingFeesPieChartData?.edgeFeesAllTimeByMarketUsd}
        formatSpecifier={CustomNumberFormatSpecifier.CURRENCY_LARGE_ABBREVIATED}
        showLegend
      />
    </StatsChartWithOverviewSection>
  );
}
