import { BaseTestProps, NextImageSrc } from '@nadohq/web-common';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { ProductLabel } from 'client/components/ProductLabel';

interface Props extends TableCellProps, BaseTestProps {
  iconSrc: NextImageSrc;
  symbol: string;
}

export function MarketProductInfoCell({
  symbol,
  iconSrc,
  className,
  dataTestId,
}: Props) {
  return (
    <TableCell className={className} dataTestId={dataTestId}>
      <ProductLabel symbol={symbol} iconSrc={iconSrc} />
    </TableCell>
  );
}
