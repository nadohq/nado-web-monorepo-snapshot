import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { BaseTestProps } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';

interface Props extends TableCellProps, BaseTestProps {
  // The dollar value to display
  value: BigNumber | undefined;
  formatSpecifier?: string;
}

export function CurrencyCell({
  value,
  formatSpecifier,
  dataTestId,
  ...rest
}: Props) {
  const formattedValue = formatNumber(value, {
    formatSpecifier:
      formatSpecifier ?? PresetNumberFormatSpecifier.CURRENCY_2DP,
  });
  return (
    <TableCell {...rest} dataTestId={dataTestId}>
      {formattedValue}
    </TableCell>
  );
}
