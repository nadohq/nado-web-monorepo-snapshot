import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useTranslation } from 'react-i18next';

interface Props {
  totalEstimatedPnlUsd: BigNumber | undefined;
  totalEstimatedRoeFrac: BigNumber | undefined;
}

export function CloseAllPositionsEstimatedPnl({
  totalEstimatedPnlUsd,
  totalEstimatedRoeFrac,
}: Props) {
  const { t } = useTranslation();

  const formattedPnl = formatNumber(totalEstimatedPnlUsd, {
    formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
  });

  const formattedRoe = formatNumber(totalEstimatedRoeFrac, {
    formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
  });

  return (
    <ValueWithLabel.Horizontal
      fitWidth
      sizeVariant="sm"
      label={t(($) => $.estimatedAbbrevPnl)}
      labelClassName="label-separator"
      valueClassName={getSignDependentColorClassName(totalEstimatedPnlUsd)}
      valueContent={
        <div className="flex items-center gap-x-1">
          {formattedPnl}
          {totalEstimatedRoeFrac && (
            <span>{t(($) => $.roeWithLabel, { formattedRoe })}</span>
          )}
        </div>
      }
    />
  );
}
