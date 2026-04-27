import {
  CustomNumberFormatSpecifier,
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { Trans } from 'react-i18next';

interface Props {
  productName: string | undefined;
  sizeToClose: BigNumber | undefined;
  amountRealizedPnL: BigNumber | undefined;
}

export function ClosePositionSummary({
  amountRealizedPnL,
  sizeToClose,
  productName,
}: Props) {
  if (!productName || !sizeToClose || !amountRealizedPnL) {
    return null;
  }

  const formattedAmountCloseSize = formatNumber(sizeToClose, {
    formatSpecifier: CustomNumberFormatSpecifier.NUMBER_AUTO,
  });

  const formattedRealizedPnL = formatNumber(amountRealizedPnL.abs(), {
    formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
  });

  return (
    <div className="text-xs">
      <Trans
        i18nKey={
          amountRealizedPnL.isPositive()
            ? ($) => $.closePositionSummary_profit
            : ($) => $.closePositionSummary_loss
        }
        values={{
          amount: formattedAmountCloseSize,
          productName,
          realizedPnL: formattedRealizedPnL,
        }}
        components={{
          highlight: <span className="text-text-primary" />,
          signdependentcolor: (
            <span
              className={getSignDependentColorClassName(amountRealizedPnL)}
            />
          ),
        }}
      />
    </div>
  );
}
