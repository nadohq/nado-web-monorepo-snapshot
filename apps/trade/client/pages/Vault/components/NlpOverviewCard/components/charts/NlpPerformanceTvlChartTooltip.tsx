import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { ChartTooltip } from 'client/components/ChartTooltip';
import { NlpPerformanceChartDataItem } from 'client/pages/Vault/components/NlpOverviewCard/components/charts/types';
import { useTranslation } from 'react-i18next';
import { useActiveTooltipDataPoints } from 'recharts';

export function NlpPerformanceTvlChartTooltip() {
  const { t } = useTranslation();
  const data = useActiveTooltipDataPoints<NlpPerformanceChartDataItem>();
  const item = data?.[0];
  if (!item) {
    return null;
  }

  return (
    <ChartTooltip.Container>
      <ChartTooltip.TimestampHeader timestampMillis={item.timestampMillis} />
      <ChartTooltip.Items>
        <ChartTooltip.Item
          title={t(($) => $.tvl)}
          content={formatNumber(item.tvlUsd, {
            formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
          })}
        />
      </ChartTooltip.Items>
    </ChartTooltip.Container>
  );
}
