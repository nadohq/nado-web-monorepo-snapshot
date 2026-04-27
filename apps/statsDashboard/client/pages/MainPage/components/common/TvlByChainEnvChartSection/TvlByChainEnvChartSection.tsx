import { CustomNumberFormatSpecifier } from '@nadohq/react-client';
import { largeCurrencyNumberAbbreviatedAxisFormatter } from 'client/components/charts/axisFormatters';
import { ChainEnvBreakdownStatsChart } from 'client/components/charts/ChainEnvBreakdownStatsChart/ChainEnvBreakdownStatsChart';
import { StatsChartWithOverviewSection } from 'client/components/StatsChartWithOverviewSection';
import { StatsFlowsValueContent } from 'client/components/StatsFlowsValueContent';
import { StatsValueWithLabel } from 'client/components/StatsValueWithLabel';
import { useChartTimeframe } from 'client/hooks/useChartTimeframe';
import { useTvlByChainEnvChartData } from 'client/pages/MainPage/components/common/TvlByChainEnvChartSection/useTvlByChainEnvChartData';
import { useTvlOverviewData } from 'client/pages/MainPage/components/common/TvlByChainEnvChartSection/useTvlOverviewData';

export function TvlByChainEnvChartSection() {
  const { data: tvlOverviewData } = useTvlOverviewData();
  const {
    data: tvlByChainEnvChartData,
    isLoading: isLoadingTvlByChainEnvChartData,
  } = useTvlByChainEnvChartData();

  const { xAxisTickFormatter } = useChartTimeframe();

  const formatSpecifier =
    CustomNumberFormatSpecifier.CURRENCY_LARGE_ABBREVIATED;

  return (
    <StatsChartWithOverviewSection
      overviewContent={
        <>
          <StatsValueWithLabel
            label="TVL"
            value={tvlOverviewData?.edgeTvlAtNowUsd}
            formatSpecifier={formatSpecifier}
          />
          <StatsValueWithLabel
            label="24h Flows"
            valueContent={
              <StatsFlowsValueContent
                inflows={tvlOverviewData?.edgeDeposits24hUsd}
                inflowsLabel="Deposited"
                outflows={tvlOverviewData?.edgeWithdrawals24hUsd}
                outflowsLabel="Withdrawn"
                formatSpecifier={formatSpecifier}
              />
            }
          />
        </>
      }
    >
      <ChainEnvBreakdownStatsChart
        chartTitle="TVL"
        chartDescription="The total value locked over time."
        data={tvlByChainEnvChartData?.tvlUsd}
        xAxisProps={{
          tickFormatter: xAxisTickFormatter,
        }}
        yAxisProps={{
          tickFormatter: largeCurrencyNumberAbbreviatedAxisFormatter,
        }}
        isLoading={isLoadingTvlByChainEnvChartData}
        chartType="area"
        hideEdgeCumulativeYAxis
      />
    </StatsChartWithOverviewSection>
  );
}
