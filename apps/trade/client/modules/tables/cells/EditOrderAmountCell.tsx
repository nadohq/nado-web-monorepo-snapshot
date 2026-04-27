import { formatNumber } from '@nadohq/react-client';
import { BaseTestProps } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { AmountWithSymbol } from 'client/components/AmountWithSymbol';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { EditOrderFieldPopover } from 'client/modules/tables/components/EditOrderFieldPopover/EditOrderFieldPopover';

interface Props extends BaseTestProps, TableCellProps {
  /** Signed amount (negative for shorts) */
  amount: BigNumber;
  formatSpecifier: string;
  symbol: string;
  productId: number;
  digest: string;
  /** Whether this is a trigger order (stop market, stop limit, TP/SL) */
  isTrigger: boolean;
  /** Order price used for minimum notional validation */
  orderPrice: BigNumber;
}

export function EditOrderAmountCell({
  amount,
  formatSpecifier,
  symbol,
  productId,
  digest,
  isTrigger,
  orderPrice,
  dataTestId,
  ...rest
}: Props) {
  const displaySize = amount.abs();
  const formattedValue = formatNumber(displaySize, {
    formatSpecifier,
  });

  return (
    <TableCell {...rest}>
      <AmountWithSymbol
        formattedAmount={formattedValue}
        symbol={symbol}
        dataTestId={dataTestId}
      />
      <EditOrderFieldPopover
        currentValue={amount}
        productId={productId}
        digest={digest}
        isTrigger={isTrigger}
        field="amount"
        triggerClassName="p-2 text-xs"
        orderPrice={orderPrice}
      />
    </TableCell>
  );
}
