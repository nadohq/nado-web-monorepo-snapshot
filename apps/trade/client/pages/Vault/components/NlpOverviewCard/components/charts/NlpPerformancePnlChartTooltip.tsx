import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { ChartTooltip } from 'client/components/ChartTooltip';
import { NlpPerformanceChartDataItem } from 'client/pages/Vault/components/NlpOverviewCard/components/charts/types';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useTranslation } from 'react-i18next';
import { useActiveTooltipDataPoints } from 'recharts';

export function NlpPerformancePnlChartTooltip() {
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
          title={t(($) => $.cumulativePnl)}
          content={
            <div
              className={getSignDependentColorClassName(item.cumulativePnlUsd)}
            >
              {formatNumber(item.cumulativePnlUsd, {
                formatSpecifier:
                  PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP,
              })}
            </div>
          }
        />
      </ChartTooltip.Items>
    </ChartTooltip.Container>
  );
}
