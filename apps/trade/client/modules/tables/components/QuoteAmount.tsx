import {
  formatNumber,
  getMarketQuoteSizeFormatSpecifier,
} from '@nadohq/react-client';
import { BaseTestProps } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { AmountWithSymbol } from 'client/components/AmountWithSymbol';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';

interface Props extends BaseTestProps {
  isPrimaryQuote: boolean;
  quoteAmount: BigNumber | undefined;
  quoteSymbol: string;
  signDependentColor?: boolean;
}

export function QuoteAmount({
  dataTestId,
  isPrimaryQuote,
  quoteAmount,
  quoteSymbol,
  signDependentColor,
}: Props) {
  const color = getSignDependentColorClassName(quoteAmount);

  return (
    <AmountWithSymbol
      dataTestId={dataTestId}
      className={signDependentColor ? color : undefined}
      formattedAmount={formatNumber(quoteAmount, {
        formatSpecifier: getMarketQuoteSizeFormatSpecifier({
          isPrimaryQuote,
          primaryQuoteAsCurrency: true,
        }),
      })}
      symbol={isPrimaryQuote ? undefined : quoteSymbol}
    />
  );
}
