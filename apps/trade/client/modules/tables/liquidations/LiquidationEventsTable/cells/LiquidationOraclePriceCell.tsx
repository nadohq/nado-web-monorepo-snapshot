import { formatNumber } from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { LIQUIDATION_MULTI_BALANCE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/liquidations/consts';
import { LiquidationEventsTableItem } from 'client/modules/tables/liquidations/types';

interface Props
  extends TableCellProps, Pick<LiquidationEventsTableItem, 'spot' | 'perp'> {}

export function LiquidationOraclePriceCell({
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
        <PriceInfo
          price={spot.oraclePrice}
          formatSpecifier={spot.priceFormatSpecifier}
        />
      )}
      {perp && (
        <PriceInfo
          price={perp.oraclePrice}
          formatSpecifier={perp.priceFormatSpecifier}
        />
      )}
    </TableCell>
  );
}

function PriceInfo({
  price,
  formatSpecifier,
}: {
  price: BigNumber;
  formatSpecifier: string;
}) {
  return (
    <span>
      {formatNumber(price, {
        formatSpecifier,
      })}
    </span>
  );
}
