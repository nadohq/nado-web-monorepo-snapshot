import { formatNumber } from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { AmountWithSymbol } from 'client/components/AmountWithSymbol';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { LIQUIDATION_MULTI_BALANCE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/liquidations/consts';
import { LiquidationEventsTableItem } from 'client/modules/tables/liquidations/types';

interface Props
  extends TableCellProps, Pick<LiquidationEventsTableItem, 'spot' | 'perp'> {}

export function LiquidationBalanceChangesCell({
  spot,
  perp,
  className,
  ...rest
}: Props) {
  return (
    <TableCell
      className={joinClassNames(
        LIQUIDATION_MULTI_BALANCE_CELL_CONTAINER_CLASSNAME,
        className,
      )}
      {...rest}
    >
      {spot && (
        <AmountWithSymbol
          className="flex-1 items-center"
          formattedAmount={formatNumber(spot.amountLiquidated.negated(), {
            formatSpecifier: spot.signedSizeFormatSpecifier,
          })}
          symbol={spot.symbol}
        />
      )}
      {perp && (
        <AmountWithSymbol
          className="flex-1 items-center"
          formattedAmount={formatNumber(perp.amountLiquidated.negated(), {
            formatSpecifier: perp.signedSizeFormatSpecifier,
          })}
          symbol={perp.symbol}
        />
      )}
    </TableCell>
  );
}
