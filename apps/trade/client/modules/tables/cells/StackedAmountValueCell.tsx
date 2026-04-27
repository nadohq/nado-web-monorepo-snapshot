import { NumberFormatSpecifier } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { StackedAmountValue } from 'client/components/StackedAmountValue';

interface Props extends TableCellProps {
  symbol: string;
  size: BigNumber | undefined;
  /** Defaults to NUMBER_AUTO */
  sizeFormatSpecifier?: string | NumberFormatSpecifier;
  /** Defaults to CURRENCY_2DP */
  valueFormatSpecifier?: string | NumberFormatSpecifier;
  valueUsd: BigNumber | undefined;
}

/**
 * Table cell component that displays a stacked amount value.
 * Shows the amount with symbol on top and USD value below.
 */
export function StackedAmountValueCell({
  symbol,
  size,
  sizeFormatSpecifier,
  valueFormatSpecifier,
  valueUsd,
  className,
  ...rest
}: Props) {
  return (
    <TableCell className={className} {...rest}>
      <StackedAmountValue
        symbol={symbol}
        size={size}
        sizeFormatSpecifier={sizeFormatSpecifier}
        valueFormatSpecifier={valueFormatSpecifier}
        valueUsd={valueUsd}
      />
    </TableCell>
  );
}
