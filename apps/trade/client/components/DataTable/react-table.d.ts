import { CellContext, ColumnDefTemplate, RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** The class name to apply to the cell container. */
    cellContainerClassName?: string;
    expandedCell?: ColumnDefTemplate<CellContext<TData, TValue>>;
  }
}
