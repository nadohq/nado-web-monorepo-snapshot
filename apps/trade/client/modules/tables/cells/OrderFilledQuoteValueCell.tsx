import { WithClassnames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { OrderFilledQuoteValue } from 'client/modules/tables/components/OrderFilledQuoteValue';

interface Props extends TableCellProps {
  filledQuoteSize: BigNumber | undefined;
  totalQuoteSize: BigNumber;
  quoteSymbol: string;
  isCloseEntirePosition: boolean;
  isPrimaryQuote: boolean;
  isMarket: boolean;
}

export function OrderFilledQuoteValueCell({
  filledQuoteSize,
  totalQuoteSize,
  quoteSymbol,
  isCloseEntirePosition,
  isPrimaryQuote,
  isMarket,
  ...rest
}: WithClassnames<Props>) {
  return (
    <TableCell {...rest}>
      <OrderFilledQuoteValue
        filledQuoteSize={filledQuoteSize}
        totalQuoteSize={totalQuoteSize}
        isPrimaryQuote={isPrimaryQuote}
        quoteSymbol={quoteSymbol}
        isMarket={isMarket}
        isCloseEntirePosition={isCloseEntirePosition}
      />
    </TableCell>
  );
}
