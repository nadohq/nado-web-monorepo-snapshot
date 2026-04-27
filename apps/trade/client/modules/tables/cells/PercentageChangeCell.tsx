import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { BaseTestProps } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';

interface Props extends BaseTestProps {
  value: BigNumber | undefined;
  /** Defaults to `SIGNED_PERCENTAGE_2DP` */
  formatSpecifier?: PresetNumberFormatSpecifier;
}

export function PercentageChangeCell({
  value,
  formatSpecifier = PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_2DP,
  dataTestId,
}: Props) {
  const color = getSignDependentColorClassName(value);

  return (
    <TableCell className={color} dataTestId={dataTestId}>
      {formatNumber(value, { formatSpecifier })}
    </TableCell>
  );
}
