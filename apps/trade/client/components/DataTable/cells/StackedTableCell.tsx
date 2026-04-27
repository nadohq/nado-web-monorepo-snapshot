import { BaseTestProps } from '@nadohq/web-common';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import {
  StackedValues,
  StackedValuesProps,
} from 'client/modules/tables/components/StackedValues';

interface Props extends StackedValuesProps, TableCellProps, BaseTestProps {}

export function StackedTableCell({
  top,
  bottom,
  withSeparator,
  className,
  dataTestId,
  ...rest
}: Props) {
  return (
    <TableCell className={className} dataTestId={dataTestId} {...rest}>
      <StackedValues top={top} bottom={bottom} withSeparator={withSeparator} />
    </TableCell>
  );
}
