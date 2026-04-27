import {
  CustomNumberFormatSpecifier,
  formatNumber,
} from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';

interface Props extends TableCellProps {
  value: BigNumber | undefined;
}

export function PnlCell({ value, className }: Props) {
  return (
    <TableCell
      className={joinClassNames(
        getSignDependentColorClassName(value),
        className,
      )}
    >
      {formatNumber(value, {
        formatSpecifier: CustomNumberFormatSpecifier.SIGNED_CURRENCY_2DP,
      })}
    </TableCell>
  );
}
