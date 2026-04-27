import { WithDataTableRowId } from 'client/components/DataTable/types';

/**
 * Standard getRowId function for Data Tables.
 * Extracts the rowId property from items that extend WithDataTableRowId.
 */
export function getRowIdFromRowId<T extends WithDataTableRowId>(
  row: T,
): string {
  return row.rowId;
}
