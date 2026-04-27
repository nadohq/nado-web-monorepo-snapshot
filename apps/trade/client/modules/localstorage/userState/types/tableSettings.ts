import { ColumnOrderState, VisibilityState } from '@tanstack/react-table';
import { CustomizableTableType } from 'client/modules/tables/customizableTables/tableConfig';

/** The settings for a customizable table */
export interface TableColumnSettings {
  /** The visibility state of the columns */
  columnVisibility: VisibilityState | undefined;
  /** The order state of the columns */
  columnOrder: ColumnOrderState | undefined;
}

/** The settings for all customizable tables */
export type TableSettings = Record<CustomizableTableType, TableColumnSettings>;
