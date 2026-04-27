import { WithClassnames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { OrderFilledPrice } from 'client/modules/tables/components/OrderFilledPrice';

interface Props extends TableCellProps {
  filledAvgPrice: BigNumber | undefined;
  orderPrice: BigNumber;
  isMarket: boolean;
  formatSpecifier: string;
}

export function OrderFilledPriceCell({
  className,
  filledAvgPrice,
  orderPrice,
  isMarket,
  formatSpecifier,
  ...rest
}: WithClassnames<Props>) {
  return (
    <TableCell className={className} {...rest}>
      <OrderFilledPrice
        filledAvgPrice={filledAvgPrice}
        orderPrice={orderPrice}
        isMarket={isMarket}
        formatSpecifier={formatSpecifier}
      />
    </TableCell>
  );
}
