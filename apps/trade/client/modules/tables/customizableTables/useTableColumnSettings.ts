import { ColumnOrderState } from '@tanstack/react-table';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import {
  CUSTOMIZABLE_TABLE_CONFIG_BY_TYPE,
  CustomizableTableType,
} from 'client/modules/tables/customizableTables/tableConfig';
import { useTableColumnLabels } from 'client/modules/tables/customizableTables/useTableColumnLabels';
import { useCallback } from 'react';

/**
 * Hook to read and write table column settings from SavedUserState.
 * Returns reactive columnOrder and columnVisibility states
 */
export function useTableColumnSettings(tableType: CustomizableTableType) {
  const columnLabels = useTableColumnLabels()[tableType];
  const { defaultColumnOrder } = CUSTOMIZABLE_TABLE_CONFIG_BY_TYPE[tableType];
  const { savedUserState, setSavedUserState } = useSavedUserState();

  const savedState = savedUserState.tables[tableType];
  const savedColumnOrder = savedState?.columnOrder;
  const savedColumnVisibility = savedState?.columnVisibility;
  const columnOrder = savedColumnOrder;
  const columnVisibility = savedColumnVisibility;

  const setColumnOrder = useCallback(
    (order: ColumnOrderState) => {
      setSavedUserState((prev) => {
        prev.tables[tableType].columnOrder =
          order.length === 0 ? undefined : order;
        return prev;
      });
    },
    [tableType, setSavedUserState],
  );

  const setColumnVisibility = useCallback(
    (columnId: string, isVisible: boolean) => {
      setSavedUserState((prev) => {
        const newColumnVisibility =
          prev.tables[tableType].columnVisibility ?? {};
        newColumnVisibility[columnId] = isVisible;
        prev.tables[tableType].columnVisibility = newColumnVisibility;
        return prev;
      });
    },
    [tableType, setSavedUserState],
  );

  const resetTableSettings = () => {
    setSavedUserState((prev) => {
      prev.tables[tableType].columnOrder = undefined;
      prev.tables[tableType].columnVisibility = undefined;
      return prev;
    });
  };

  return {
    defaultColumnOrder,
    columnLabels,
    columnOrder,
    columnVisibility,
    setColumnOrder,
    setColumnVisibility,
    resetTableSettings,
  };
}
