import { PaginationState } from '@tanstack/react-table';
import { Dispatch, SetStateAction } from 'react';

/**
 * Base interface for table items that require a unique row identifier.
 * All TableItem types used with DataTable should extend this interface.
 *
 * @example
 * ```typescript
 * interface MyTableItem extends WithDataTableRowId {
 *   name: string;
 *   value: number;
 * }
 *
 * // In your hook, construct rowId directly:
 * const data: MyTableItem[] = rawData.map(item => ({
 *   ...item,
 *   rowId: String(item.id), // or template literal for composite keys
 * }));
 * ```
 */
export interface WithDataTableRowId {
  rowId: string;
}

export type DataTableState = 'empty' | 'loading' | 'filled';

export type DataTableColumnPosition = 'left' | 'right' | 'center';

/** Context for pagination UI and controls */
export interface DataTablePagination {
  /*** Whether a next page may be available */
  hasNextPage: boolean;
  /*** The total number of pages available */
  pageCount: number;
  /*** The current pagination state */
  paginationState: PaginationState;
  /*** Function to set the pagination state */
  setPaginationState: Dispatch<SetStateAction<PaginationState>>;
}
