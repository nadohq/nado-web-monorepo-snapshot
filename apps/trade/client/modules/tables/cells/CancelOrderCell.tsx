import { BaseTestProps, joinClassNames } from '@nadohq/web-common';
import { CancelOrderButton } from 'client/components/ActionButtons/CancelOrderButton';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { CancellableOrderWithNotificationInfo } from 'client/hooks/execute/cancelOrder/types';

interface Props extends TableCellProps, BaseTestProps {
  order: CancellableOrderWithNotificationInfo;
}

export function CancelOrderCell({ order, className, dataTestId }: Props) {
  return (
    <TableCell className={joinClassNames('justify-end', className)}>
      <CancelOrderButton order={order} dataTestId={dataTestId} />
    </TableCell>
  );
}
