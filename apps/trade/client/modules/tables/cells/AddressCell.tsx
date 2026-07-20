import { truncateAddress } from '@nadohq/react-client';
import { useCopyText } from '@nadohq/web-common';
import { CopyIcon, TextButton } from '@nadohq/web-ui';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';

interface Props extends TableCellProps {
  address: string;
}

export function AddressCell({ address, className, dataTestId }: Props) {
  const { isCopied, copy } = useCopyText();

  return (
    <TableCell className={className}>
      <span className="flex items-center gap-x-1">
        {truncateAddress(address)}
        <TextButton colorVariant="tertiary" onClick={() => copy(address)}>
          <CopyIcon size={14} isCopied={isCopied} dataTestId={dataTestId} />
        </TextButton>
      </span>
    </TableCell>
  );
}
