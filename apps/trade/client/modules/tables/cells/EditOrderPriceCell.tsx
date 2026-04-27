import { formatNumber } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { EditOrderFieldPopover } from 'client/modules/tables/components/EditOrderFieldPopover/EditOrderFieldPopover';
import { EditOrderField } from 'client/modules/tables/components/EditOrderFieldPopover/useEditOrderFieldPopover';

interface Props extends TableCellProps {
  currentValue: BigNumber;
  formatSpecifier: string;
  productId: number;
  digest: string;
  /** Whether this is a trigger order (stop market, stop limit, TP/SL) */
  isTrigger: boolean;
  /** Which field to modify */
  field: EditOrderField;
}

export function EditOrderPriceCell({
  currentValue,
  formatSpecifier,
  productId,
  digest,
  isTrigger,
  field,
  ...rest
}: Props) {
  const formattedValue = formatNumber(currentValue, {
    formatSpecifier,
  });

  return (
    <TableCell {...rest}>
      <span>{formattedValue}</span>
      <EditOrderFieldPopover
        currentValue={currentValue}
        productId={productId}
        digest={digest}
        isTrigger={isTrigger}
        field={field}
        triggerClassName="p-2 text-xs"
        orderPrice={undefined}
      />
    </TableCell>
  );
}
