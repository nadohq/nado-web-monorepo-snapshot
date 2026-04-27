import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { LabelTooltip } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { MaintMarginUsageBar } from 'client/components/MaintMarginUsageBar';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { getRiskClassNames } from 'client/utils/getRiskClassNames';
import { useTranslation } from 'react-i18next';

interface Props {
  maintMarginUsageFraction: BigNumber | undefined;
  maintMarginBoundedUsd: BigNumber | undefined;
}

export function OverviewMaintMarginUsage({
  maintMarginUsageFraction,
  maintMarginBoundedUsd,
}: Props) {
  const { t } = useTranslation();

  const riskTextColorClassName = getRiskClassNames(
    maintMarginUsageFraction,
  ).text;

  return (
    <LabelTooltip
      label={
        <ValueWithLabel.Vertical
          label={t(($) => $.availableMaintMargin)}
          labelClassName="text-text-secondary"
          value={maintMarginBoundedUsd}
          className="items-end"
          valueClassName={riskTextColorClassName}
          numberFormatSpecifier={PresetNumberFormatSpecifier.CURRENCY_2DP}
        />
      }
    >
      <div className="flex items-center gap-x-2 lg:gap-x-2.5">
        <MaintMarginUsageBar
          maintMarginUsageFraction={maintMarginUsageFraction}
          className="w-24 sm:w-16"
        />
        <span className={riskTextColorClassName}>
          {formatNumber(maintMarginUsageFraction, {
            formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
          })}
        </span>
      </div>
    </LabelTooltip>
  );
}
