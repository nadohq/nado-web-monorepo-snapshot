import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Icons, TextButton } from '@nadohq/web-ui';
import { ColumnOrderState } from '@tanstack/react-table';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { ColumnSortableItem } from 'client/modules/tables/customizableTables/CustomizableTableColumnsDialog/ColumnSortableItem';
import { CustomizableTableType } from 'client/modules/tables/customizableTables/tableConfig';
import { useTableColumnLabels } from 'client/modules/tables/customizableTables/useTableColumnLabels';
import { useTableColumnSettings } from 'client/modules/tables/customizableTables/useTableColumnSettings';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface CustomizableTableColumnsDialogParams {
  tableType: CustomizableTableType;
}

export function CustomizableTableColumnsDialog({
  tableType,
}: CustomizableTableColumnsDialogParams) {
  const { t } = useTranslation();

  const columnLabels = useTableColumnLabels();
  const {
    defaultColumnOrder,
    columnOrder,
    columnVisibility,
    setColumnOrder,
    setColumnVisibility,
    resetTableSettings,
  } = useTableColumnSettings(tableType);

  const { hide } = useDialog();

  const columns = useMemo(() => {
    const orderToUse = (columnOrder ??
      defaultColumnOrder) as typeof defaultColumnOrder;
    return orderToUse.map((id) => ({
      id,
      label: columnLabels[tableType]?.[id] ?? id,
      isVisible: columnVisibility?.[id] ?? true,
    }));
  }, [
    columnLabels,
    tableType,
    columnOrder,
    defaultColumnOrder,
    columnVisibility,
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = columns.findIndex((col) => col.id === active.id);
    const newIndex = columns.findIndex((col) => col.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Reorder the columns using arrayMove
    const newOrder = arrayMove(columns, oldIndex, newIndex);

    // Update column order
    const newColumnOrder: ColumnOrderState = newOrder.map(
      (col: { id: string }) => col.id,
    );

    setColumnOrder(newColumnOrder);
  };

  const handleReset = () => {
    resetTableSettings();
  };

  const handleClose = () => {
    hide();
  };

  return (
    <BaseAppDialog.Container onClose={handleClose}>
      <BaseAppDialog.Title onClose={handleClose}>
        {t(($) => $.dialogTitles.editColumns)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={columns.map((col) => col.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col">
              {columns.map((column) => (
                <ColumnSortableItem
                  key={column.id}
                  id={column.id}
                  label={column.label}
                  isVisible={column.isVisible}
                  onVisibilityChange={(checked) =>
                    setColumnVisibility(column.id, checked)
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <TextButton
          className="w-max self-end"
          startIcon={<Icons.ArrowCounterClockwise size={16} />}
          onClick={handleReset}
          colorVariant="secondary"
        >
          {t(($) => $.buttons.resetToDefault)}
        </TextButton>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
