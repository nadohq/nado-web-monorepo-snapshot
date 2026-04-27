'use client';

import { PresetNumberFormatSpecifier, useNlpState } from '@nadohq/react-client';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useTranslation } from 'react-i18next';

export function NlpHeaderMetrics() {
  const { t } = useTranslation();
  const { tvlUsd, apr } = useNlpState();

  return (
    <div className="flex gap-x-10">
      <ValueWithLabel.Vertical
        sizeVariant="xl"
        label={t(($) => $.tvl)}
        value={tvlUsd}
        numberFormatSpecifier={PresetNumberFormatSpecifier.CURRENCY_INT}
      />
      <ValueWithLabel.Vertical
        sizeVariant="xl"
        label={t(($) => $.apr)}
        value={apr}
        valueClassName={getSignDependentColorClassName(apr)}
        numberFormatSpecifier={PresetNumberFormatSpecifier.PERCENTAGE_2DP}
      />
    </div>
  );
}
