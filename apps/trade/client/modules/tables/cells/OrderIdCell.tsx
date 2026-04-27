import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { OrderIdCopyButton } from 'client/modules/tables/components/OrderIdCopyButton';

interface Props extends TableCellProps {
  orderId: string;
}

export function OrderIdCell({ orderId, className }: Props) {
  return (
    <TableCell className={className}>
      <OrderIdCopyButton orderId={orderId} />
    </TableCell>
  );
}
