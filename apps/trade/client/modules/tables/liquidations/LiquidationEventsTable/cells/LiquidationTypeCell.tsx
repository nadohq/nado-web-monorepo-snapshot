import { joinClassNames } from '@nadohq/web-common';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import {
  LiquidatedBalanceType,
  LiquidationEventsTableItem,
} from 'client/modules/tables/liquidations/types';
import { useTranslation } from 'react-i18next';

interface LiquidationTypeCellProps extends TableCellProps {
  liquidatedBalanceTypes: LiquidationEventsTableItem['liquidatedBalanceTypes'];
}

export function LiquidationTypeCell({
  liquidatedBalanceTypes,
  className,
  ...rest
}: LiquidationTypeCellProps) {
  const { t } = useTranslation();

  return (
    <TableCell
      className={joinClassNames(
        'text-text-tertiary flex flex-col items-start justify-center gap-y-2',
        className,
      )}
      {...rest}
    >
      {liquidatedBalanceTypes.map((type: LiquidatedBalanceType) => (
        <div key={type}>{t(($) => $.liquidatedBalanceTypes[type])}</div>
      ))}
    </TableCell>
  );
}
