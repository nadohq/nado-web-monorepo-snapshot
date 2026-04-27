import {
  CustomNumberFormatSpecifier,
  formatNumber,
  NumberFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { AmountWithSymbol } from 'client/components/AmountWithSymbol';
import { StackedValues } from 'client/modules/tables/components/StackedValues';

interface Props extends WithClassnames {
  symbol: string;
  size: BigNumber | undefined;
  /** Defaults to NUMBER_AUTO */
  sizeFormatSpecifier?: string | NumberFormatSpecifier;
  /** Defaults to CURRENCY_2DP */
  valueFormatSpecifier?: string | NumberFormatSpecifier;
  valueUsd: BigNumber | undefined;
}

/**
 * Displays a stacked amount with symbol on top and USD value below.
 * Example:
 *   1 wBTC
 *   $50,000
 */
export function StackedAmountValue({
  symbol,
  size,
  sizeFormatSpecifier,
  valueFormatSpecifier,
  valueUsd,
  className,
}: Props) {
  const formattedSize = formatNumber(size, {
    formatSpecifier:
      sizeFormatSpecifier ?? CustomNumberFormatSpecifier.NUMBER_AUTO,
  });
  const formattedValue = formatNumber(valueUsd, {
    formatSpecifier:
      valueFormatSpecifier ?? PresetNumberFormatSpecifier.CURRENCY_2DP,
  });

  return (
    <StackedValues
      className={className}
      top={<AmountWithSymbol formattedAmount={formattedSize} symbol={symbol} />}
      bottom={formattedValue}
    />
  );
}
