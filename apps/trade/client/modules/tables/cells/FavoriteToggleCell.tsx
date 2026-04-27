import { WithClassnames, mergeClassNames } from '@nadohq/web-common';
import { FavoriteButton } from 'client/components/ActionButtons/FavoriteButton';
import { TableCell } from 'client/components/DataTable/cells/TableCell';

interface Props extends WithClassnames {
  isFavorited: boolean;
  disabled: boolean;
  toggleIsFavorited: (marketId: number) => void;
  productId: number;
  favoriteButtonSize: number;
  favoriteButtonClassName?: string;
}

export function FavoriteToggleCell({
  isFavorited,
  disabled,
  toggleIsFavorited,
  productId,
  className,
  favoriteButtonSize,
  favoriteButtonClassName,
}: Props) {
  return (
    <TableCell className={className}>
      <FavoriteButton
        size={favoriteButtonSize}
        className={mergeClassNames('p-1.5', favoriteButtonClassName)}
        isFavorited={isFavorited}
        disabled={disabled}
        onClick={(e) => {
          // Prevent the click from bubbling up to the row's click handler.
          // This is particularly important for the market switcher,
          // where clicking would otherwise navigate to the market page.
          e.stopPropagation();
          e.preventDefault();
          toggleIsFavorited(productId);
        }}
        dataTestId="trading-market-switcher-favorite-toggle-cell"
      />
    </TableCell>
  );
}
