import { formatNumber, NumberFormatSpecifier } from '@nadohq/react-client';
import { BaseTestProps } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { AmountWithSymbol } from 'client/components/AmountWithSymbol';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';

interface Props extends TableCellProps, BaseTestProps {
  // The asset size to display
  amount: BigNumber | undefined;
  // The asset symbol to display
  symbol: string | undefined;
  formatSpecifier: NumberFormatSpecifier | string;
}

export function AmountWithSymbolCell({
  amount,
  symbol,
  formatSpecifier,
  dataTestId,
  ...rest
}: Props) {
  const formattedSize = formatNumber(amount, {
    formatSpecifier,
  });
  return (
    <TableCell {...rest}>
      <AmountWithSymbol
        formattedAmount={formattedSize}
        symbol={symbol}
        dataTestId={dataTestId}
      />
    </TableCell>
  );
}
