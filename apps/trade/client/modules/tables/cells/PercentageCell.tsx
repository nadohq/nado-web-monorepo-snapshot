import {
  formatNumber,
  NumberFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';

interface Props extends TableCellProps {
  fraction: BigNumber | undefined;
  formatSpecifier?: NumberFormatSpecifier;
}

export function PercentageCell({ fraction, formatSpecifier, ...rest }: Props) {
  const formattedPercentage = formatNumber(fraction, {
    formatSpecifier:
      formatSpecifier ?? PresetNumberFormatSpecifier.PERCENTAGE_2DP,
  });

  return <TableCell {...rest}>{formattedPercentage}</TableCell>;
}
