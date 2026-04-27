import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { ChartTooltip } from 'client/components/ChartTooltip';
import { FundingChartItem } from 'client/modules/trading/chart/funding/useFundingChart';
import { useTranslation } from 'react-i18next';
import { useActiveTooltipDataPoints } from 'recharts';

export function FundingChartTooltip() {
  const { t } = useTranslation();

  const data = useActiveTooltipDataPoints<FundingChartItem>();
  const item = data?.[0];
  if (!item) {
    return null;
  }

  return (
    <ChartTooltip.Container>
      <ChartTooltip.TimestampHeader timestampMillis={item.timestampMillis} />
      <ChartTooltip.Item
        title={t(($) => $.fundingRate)}
        content={formatNumber(item.fundingRate, {
          formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_UPTO_4DP,
        })}
      />
    </ChartTooltip.Container>
  );
}
