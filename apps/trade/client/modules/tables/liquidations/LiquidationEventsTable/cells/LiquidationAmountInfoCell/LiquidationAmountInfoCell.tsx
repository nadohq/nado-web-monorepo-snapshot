import { ProductEngineType } from '@nadohq/client';
import { joinClassNames } from '@nadohq/web-common';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { LiquidationInfo } from 'client/modules/tables/liquidations/LiquidationEventsTable/cells/LiquidationAmountInfoCell/components/LiquidationInfo';
import { LIQUIDATION_MULTI_BALANCE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/liquidations/consts';
import { LiquidationEventsTableItem } from 'client/modules/tables/liquidations/types';

type LiquidationAmountInfoCellProps = TableCellProps &
  Pick<LiquidationEventsTableItem, 'spot' | 'perp'>;

export function LiquidationAmountInfoCell({
  spot,
  perp,
  className,
  ...rest
}: LiquidationAmountInfoCellProps) {
  return (
    <TableCell
      className={joinClassNames(
        LIQUIDATION_MULTI_BALANCE_CELL_CONTAINER_CLASSNAME,
        className,
      )}
      {...rest}
    >
      {spot && (
        <LiquidationInfo
          productId={spot.productId}
          productType={ProductEngineType.SPOT}
          productLabel={spot.productName}
          isIsolated={spot.isIsolated}
          amountLiquidated={spot.amountLiquidated}
          sizeFormatSpecifier={spot.sizeFormatSpecifier}
          amountLiquidatedValueUsd={spot.liquidatedValueUsd}
          symbol={spot.symbol}
        />
      )}
      {perp && (
        <LiquidationInfo
          productId={perp.productId}
          productType={ProductEngineType.PERP}
          productLabel={perp.productName}
          isIsolated={perp.isIsolated}
          amountLiquidated={perp.amountLiquidated}
          sizeFormatSpecifier={perp.sizeFormatSpecifier}
          amountLiquidatedValueUsd={perp.liquidatedValueUsd}
          symbol={perp.symbol}
        />
      )}
    </TableCell>
  );
}
