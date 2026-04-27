import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { FundingRatePeriodSelect } from 'client/modules/trading/components/FundingRatePeriodSelect';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  predictedFundingRate: BigNumber | undefined;
}

export function FundingChartHeader({ predictedFundingRate, className }: Props) {
  const { t } = useTranslation();

  return (
    <div
      className={joinClassNames('flex items-center gap-x-1 text-xs', className)}
    >
      <ValueWithLabel.Horizontal
        // on mobile, we do show "Predicted Funding" in the primarily historical chart
        // as funding may not be always visible in infobar depending scroll position
        className="lg:hidden"
        sizeVariant="xs"
        label={t(($) => $.predictedFunding)}
        value={predictedFundingRate}
        numberFormatSpecifier={PresetNumberFormatSpecifier.PERCENTAGE_UPTO_4DP}
        valueClassName={getSignDependentColorClassName(predictedFundingRate)}
      />
      <span className="hidden lg:flex">{t(($) => $.standardizeRatesTo)}</span>
      <FundingRatePeriodSelect />
    </div>
  );
}
