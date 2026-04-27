import {
  BaseTestProps,
  hasClass,
  mergeClassNames,
  WithClassnames,
} from '@nadohq/web-common';
import { getStateOverlayClassNames } from '@nadohq/web-ui';
import { flexRender, Row, RowData } from '@tanstack/react-table';
import { DataTableLayoutProps } from 'client/components/DataTable/components/DataTableLayout';
import {
  TABLE_CELL_LEFT_PADDING_CLASSNAME,
  TABLE_CELL_RIGHT_PADDING_CLASSNAME,
} from 'client/components/DataTable/consts';
import { DataTableColumnPosition } from 'client/components/DataTable/types';

interface Props<TData extends RowData = RowData>
  extends
    WithClassnames<Pick<DataTableLayoutProps<TData>, 'fitDataRowHeight'>>,
    BaseTestProps {
  row: Row<TData>;
  position: DataTableColumnPosition;
  hoveredRowId: string | null;
  setHoveredRowId: (hoveredRowId: string | null) => void;
}

export function DataTableRowGroup<TData extends RowData>({
  row,
  className,
  position,
  hoveredRowId,
  fitDataRowHeight,
  setHoveredRowId,
  dataTestId,
}: Props<TData>) {
  const hoverOverlayClassName = getStateOverlayClassNames({
    borderRadiusVariant: 'none',
    // Force active to mimic the hover effect, which is controlled via state instead of a CSS hover.
    active: true,
  });
  // Get cells for the given position
  const cells = (() => {
    switch (position) {
      case 'left':
        return row.getLeftVisibleCells();
      case 'right':
        return row.getRightVisibleCells();
      case 'center':
        return row.getCenterVisibleCells();
    }
  })();

  return (
    <div
      key={row.id}
      className={mergeClassNames(
        'flex items-center',
        'border-overlay-divider border-t first:border-t-0',
        hoveredRowId === row.id && hoverOverlayClassName,
        // Static height as a default
        !fitDataRowHeight && 'h-14',
        // Fits cell content with default padding
        fitDataRowHeight && 'h-fit py-3',
        className,
      )}
      onMouseEnter={() => setHoveredRowId(row.id)}
      onMouseLeave={() => setHoveredRowId(null)}
      data-testid={dataTestId}
    >
      {cells.map((cell, index) => {
        const cellContainerClassName =
          cell.column.columnDef.meta?.cellContainerClassName;

        const isWidthFlexible = hasClass(
          cellContainerClassName,
          'min-w-',
          'max-w-',
        );
        const isFirst = index === 0;
        const isLast = index === cells.length - 1;

        return (
          <div
            key={cell.id}
            className={mergeClassNames(
              cellContainerClassName,
              isWidthFlexible && 'flex-1',
              isFirst && TABLE_CELL_LEFT_PADDING_CLASSNAME,
              isLast && TABLE_CELL_RIGHT_PADDING_CLASSNAME,
            )}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        );
      })}
    </div>
  );
}
