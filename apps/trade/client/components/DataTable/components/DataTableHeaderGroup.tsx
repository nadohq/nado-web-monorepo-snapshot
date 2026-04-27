import { hasClass, mergeClassNames, WithClassnames } from '@nadohq/web-common';
import { flexRender, HeaderGroup, RowData } from '@tanstack/react-table';
import {
  TABLE_CELL_LEFT_PADDING_CLASSNAME,
  TABLE_CELL_RIGHT_PADDING_CLASSNAME,
} from 'client/components/DataTable/consts';

export function DataTableHeaderGroup<TData extends RowData>({
  headerGroup,
  className,
}: WithClassnames<{
  headerGroup: HeaderGroup<TData>;
}>) {
  return (
    <div
      className={mergeClassNames('flex h-9 items-center', className)}
      key={headerGroup.id}
    >
      {headerGroup.headers.map((header, index) => {
        if (header.isPlaceholder) {
          return null;
        }

        const cellContainerClassName =
          header.column.columnDef.meta?.cellContainerClassName;

        const isWidthFlexible = hasClass(
          cellContainerClassName,
          'min-w-',
          'max-w-',
        );
        const isFirst = index === 0;
        const isLast = index === headerGroup.headers.length - 1;

        return (
          <div
            key={header.id}
            className={mergeClassNames(
              cellContainerClassName,
              isWidthFlexible && 'flex-1',
              isFirst && TABLE_CELL_LEFT_PADDING_CLASSNAME,
              isLast && TABLE_CELL_RIGHT_PADDING_CLASSNAME,
            )}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
          </div>
        );
      })}
    </div>
  );
}
