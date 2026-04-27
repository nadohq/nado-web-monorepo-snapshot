import { ScrollShadowsContainer } from '@nadohq/web-ui';
import { Table } from '@tanstack/react-table';
import { DataTableHeaderGroup } from 'client/components/DataTable/components/DataTableHeaderGroup';
import { DataTableRowGroup } from 'client/components/DataTable/components/DataTableRowGroup';
import { first } from 'lodash';
import { useState } from 'react';

export interface DataTableLayoutProps<TData> {
  table: Table<TData>;
  headerRowClassName: string | undefined;
  dataRowContainerClassName: string | undefined;
  dataRowClassName: string | undefined;
  fitDataRowHeight: boolean | undefined;
}

/**
 * A layout component that renders the table with pinned columns and scrollable center columns.
 * If there are no pinned columns, the center columns will be scrollable.
 * @param params - The parameters for the component.
 * @returns The layout content.
 */
export function DataTableLayout<TData>({
  table,
  headerRowClassName,
  dataRowContainerClassName,
  dataRowClassName,
  fitDataRowHeight,
}: DataTableLayoutProps<TData>) {
  // State to track which row is currently being hovered
  // Since rows are broken up into multiple groups, we need to track the hovered row
  // to highlight the entire row when the user hovers over it
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  // Get pinned and center header groups
  const leftHeaderGroups = table.getLeftHeaderGroups();
  const centerHeaderGroups = table.getCenterHeaderGroups();
  const rightHeaderGroups = table.getRightHeaderGroups();

  // Check if we have any pinned columns
  const hasLeftPinnedColumns = Boolean(first(leftHeaderGroups)?.headers.length);
  const hasRightPinnedColumns = Boolean(
    first(rightHeaderGroups)?.headers.length,
  );

  return (
    <div className="flex overflow-hidden">
      {/* Left pinned columns */}
      {hasLeftPinnedColumns && (
        <div className="shrink-0">
          {leftHeaderGroups.map((headerGroup) => (
            <DataTableHeaderGroup
              headerGroup={headerGroup}
              key={headerGroup.id}
              className={headerRowClassName}
            />
          ))}
          {/* Container needed to programmatically remove the top border of the first row */}
          <div className={dataRowContainerClassName}>
            {table.getRowModel().rows.map((row) => (
              <DataTableRowGroup
                row={row}
                key={row.id}
                fitDataRowHeight={fitDataRowHeight}
                className={dataRowClassName}
                position="left"
                hoveredRowId={hoveredRowId}
                setHoveredRowId={setHoveredRowId}
                dataTestId={`data-table-row-group-left-${row.id}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Scrollable center columns */}
      <ScrollShadowsContainer
        orientation="horizontal"
        className="flex-1 overscroll-x-none"
      >
        <div className="h-full min-w-max">
          {centerHeaderGroups.map((headerGroup) => (
            <DataTableHeaderGroup
              headerGroup={headerGroup}
              key={headerGroup.id}
              className={headerRowClassName}
            />
          ))}
          <div className={dataRowContainerClassName}>
            {table.getRowModel().rows.map((row) => (
              <DataTableRowGroup
                row={row}
                key={row.id}
                fitDataRowHeight={fitDataRowHeight}
                className={dataRowClassName}
                position="center"
                hoveredRowId={hoveredRowId}
                setHoveredRowId={setHoveredRowId}
                dataTestId={`data-table-row-group-center-${row.id}`}
              />
            ))}
          </div>
        </div>
      </ScrollShadowsContainer>

      {/* Right pinned columns */}
      {hasRightPinnedColumns && (
        <div className="shrink-0">
          {rightHeaderGroups.map((headerGroup) => (
            <DataTableHeaderGroup
              headerGroup={headerGroup}
              key={headerGroup.id}
              className={headerRowClassName}
            />
          ))}
          <div className={dataRowContainerClassName}>
            {table.getRowModel().rows.map((row) => (
              <DataTableRowGroup
                row={row}
                key={row.id}
                fitDataRowHeight={fitDataRowHeight}
                className={dataRowClassName}
                position="right"
                hoveredRowId={hoveredRowId}
                setHoveredRowId={setHoveredRowId}
                dataTestId={`data-table-row-group-right-${row.id}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
