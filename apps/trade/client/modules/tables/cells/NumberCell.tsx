import {
  formatNumber,
  NumberFormatSpecifier,
  NumberFormatValue,
} from '@nadohq/react-client';
import { BaseTestProps } from '@nadohq/web-common';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';

interface Props extends TableCellProps, BaseTestProps {
  value: NumberFormatValue | undefined;
  formatSpecifier: NumberFormatSpecifier | string;
}

export function NumberCell({
  value,
  formatSpecifier,
  dataTestId,
  ...rest
}: Props) {
  const formattedValue = formatNumber(value, {
    formatSpecifier: formatSpecifier,
  });
  return (
    <TableCell {...rest} dataTestId={dataTestId}>
      {formattedValue}
    </TableCell>
  );
}
