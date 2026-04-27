import { BaseTestProps } from '@nadohq/web-common';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import {
  OrderIsReduceOnly,
  OrderIsReduceOnlyProps,
} from 'client/modules/tables/components/OrderIsReduceOnly';

type Props = OrderIsReduceOnlyProps & TableCellProps & BaseTestProps;

export function OrderIsReduceOnlyCell({
  isReduceOnly,
  dataTestId,
  ...rest
}: Props) {
  return (
    <TableCell {...rest} dataTestId={dataTestId}>
      <OrderIsReduceOnly isReduceOnly={isReduceOnly} />
    </TableCell>
  );
}
