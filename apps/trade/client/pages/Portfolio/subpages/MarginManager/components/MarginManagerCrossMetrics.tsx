'use client';

import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { MaintMarginUsageBar } from 'client/components/MaintMarginUsageBar';
import { useSubaccountOverview } from 'client/hooks/subaccount/useSubaccountOverview/useSubaccountOverview';
import { MarginManagerMetrics } from 'client/pages/Portfolio/subpages/MarginManager/components/MarginManagerMetrics';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function MarginManagerCrossMetrics() {
  const { t } = useTranslation();

  const { data: overview } = useSubaccountOverview();

  const metricsItems = useMemo(
    () => [
      {
        label: t(($) => $.marginUsage),
        value: overview?.marginUsageFractionBounded,
        numberFormatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
      },
      {
        label: t(($) => $.maintMarginUsage),
        valueContent: (
          <div className="flex items-center gap-x-2 lg:gap-x-2.5">
            {formatNumber(overview?.maintMarginUsageFractionBounded, {
              formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
            })}
            <MaintMarginUsageBar
              maintMarginUsageFraction={
                overview?.maintMarginUsageFractionBounded
              }
              className="h-2 w-14 lg:h-3.5 lg:w-28"
            />
          </div>
        ),
      },
      {
        label: t(($) => $.availableMargin),
        value: overview?.initialMarginBoundedUsd,
        numberFormatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
      },
      {
        label: t(($) => $.fundsUntilLiquidation),
        value: overview?.maintMarginBoundedUsd,
        numberFormatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
      },
    ],
    [
      overview?.marginUsageFractionBounded,
      overview?.maintMarginUsageFractionBounded,
      overview?.initialMarginBoundedUsd,
      overview?.maintMarginBoundedUsd,
      t,
    ],
  );

  return (
    <MarginManagerMetrics
      title={t(($) => $.unifiedMargin)}
      metricsItems={metricsItems}
    />
  );
}
