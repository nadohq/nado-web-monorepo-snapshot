import { BaseTestProps } from '@nadohq/web-common';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { DateTime } from 'client/components/DateTime';

interface Props extends TableCellProps, BaseTestProps {
  timestampMillis: number;
}

export function DateTimeCell({
  timestampMillis,
  className,
  dataTestId,
  ...rest
}: Props) {
  return (
    <TableCell className={className} dataTestId={dataTestId} {...rest}>
      <DateTime
        timestampMillis={timestampMillis}
        className="flex flex-col gap-1.5"
        timeClassName="text-text-tertiary"
      />
    </TableCell>
  );
}
