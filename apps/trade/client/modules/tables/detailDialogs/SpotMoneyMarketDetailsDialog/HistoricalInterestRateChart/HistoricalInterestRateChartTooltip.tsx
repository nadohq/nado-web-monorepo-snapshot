import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { ChartTooltip } from 'client/components/ChartTooltip';
import { HistoricalInterestRateChartDataItem } from 'client/modules/tables/detailDialogs/SpotMoneyMarketDetailsDialog/HistoricalInterestRateChart/hooks/useHistoricalInterestRateChartData';
import { useTranslation } from 'react-i18next';
import { useActiveTooltipDataPoints } from 'recharts';

interface Props {
  isDeposit: boolean;
}

export function HistoricalInterestRateChartTooltip({ isDeposit }: Props) {
  const { t } = useTranslation();

  const data =
    useActiveTooltipDataPoints<HistoricalInterestRateChartDataItem>();
  const item = data?.[0];
  if (!item) {
    return null;
  }

  return (
    <ChartTooltip.Container>
      <ChartTooltip.TimestampHeader timestampMillis={item.timestampMillis} />
      <ChartTooltip.Items>
        {isDeposit ? (
          <ChartTooltip.Item
            title={t(($) => $.depositApy)}
            content={formatNumber(item.depositApyFraction, {
              formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
            })}
          />
        ) : (
          <ChartTooltip.Item
            title={t(($) => $.borrowApy)}
            content={formatNumber(item.borrowApyFraction, {
              formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
            })}
          />
        )}
      </ChartTooltip.Items>
    </ChartTooltip.Container>
  );
}
