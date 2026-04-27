import {
  getMarketQuoteSizeFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { BaseTestProps } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { AmountWithSymbolCell } from 'client/modules/tables/cells/AmountWithSymbolCell';
import { CurrencyCell } from 'client/modules/tables/cells/CurrencyCell';

interface Props extends BaseTestProps {
  quoteSize: BigNumber;
  quoteSymbol: string;
  isCloseEntirePosition: boolean;
  isPrimaryQuote: boolean;
  isFee?: boolean;
}

export function OrderQuoteValueCell({
  quoteSize,
  quoteSymbol,
  isCloseEntirePosition,
  isPrimaryQuote,
  isFee,
  dataTestId,
}: Props) {
  if (isCloseEntirePosition) {
    return <TableCell dataTestId={dataTestId}>-</TableCell>;
  }

  return isPrimaryQuote ? (
    <CurrencyCell
      value={quoteSize}
      formatSpecifier={
        isFee ? PresetNumberFormatSpecifier.CURRENCY_UPTO_3DP : undefined
      }
      dataTestId={dataTestId}
    />
  ) : (
    <AmountWithSymbolCell
      amount={quoteSize}
      symbol={quoteSymbol}
      formatSpecifier={getMarketQuoteSizeFormatSpecifier({ isPrimaryQuote })}
      dataTestId={dataTestId}
    />
  );
}
