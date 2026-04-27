import { mergeClassNames } from '@nadohq/web-common';
import { Header } from '@tanstack/react-table';
import { FavoriteButton } from 'client/components/ActionButtons/FavoriteButton';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';

interface FavoriteHeaderCellProps<T> extends TableCellProps {
  header: Header<T, any>;
  disableFavoriteButton: boolean;
  favoriteButtonSize: number;
  favoriteButtonClassName?: string;
}

export function FavoriteHeaderCell<T>({
  header,
  disableFavoriteButton,
  className,
  favoriteButtonSize,
  favoriteButtonClassName,
}: FavoriteHeaderCellProps<T>) {
  const isSorted = header.column.getIsSorted() === 'asc';

  return (
    <TableCell className={className}>
      <FavoriteButton
        size={favoriteButtonSize}
        // Adding padding to increase touch target
        className={mergeClassNames('p-1.5', favoriteButtonClassName)}
        isFavorited={isSorted}
        disabled={disableFavoriteButton}
        onClick={() => {
          header.column.toggleSorting(isSorted ? undefined : false);
        }}
      />
    </TableCell>
  );
}
