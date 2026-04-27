import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { AmountWithSymbol } from 'client/components/AmountWithSymbol';

interface Props {
  amountLiquidated: BigNumber;
  amountFormatSpecifier: string;
  amountLiquidatedValueUsd: BigNumber;
  symbol: string;
}

export function LiquidationSizeInfo({
  amountLiquidated,
  amountFormatSpecifier,
  amountLiquidatedValueUsd,
  symbol,
}: Props) {
  return (
    <div className="flex flex-col gap-y-1.5 whitespace-nowrap">
      <AmountWithSymbol
        formattedAmount={formatNumber(amountLiquidated.abs(), {
          formatSpecifier: amountFormatSpecifier,
        })}
        symbol={symbol}
      />
      <div className="text-text-tertiary">
        {formatNumber(amountLiquidatedValueUsd.abs(), {
          formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
        })}
      </div>
    </div>
  );
}
