// TanStack Table's useReactTable() API returns functions that cannot be memoized safely, so we use 'use no memo'.
// https://github.com/TanStack/table/issues/5567
'use no memo';

import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { getRowIdFromRowId } from 'client/components/DataTable/utils/getRowIdFromRowId';
import { TableHeaderGroup } from 'client/modules/commandCenter/components/tables/BaseTable/TableHeaderGroup';
import { TableRow } from 'client/modules/commandCenter/components/tables/BaseTable/TableRow';
import { useMemo, useState } from 'react';

export type BaseTableProps<TData extends WithDataTableRowId> = {
  /** A unique id for distinguishing the table, helpful for creating unique row ids across tables. */
  id: string;
  columns: ColumnDef<TData, any>[];
  data: TData[] | undefined;
  initialSortingState?: SortingState;
  onSelect: (row: Row<TData>) => void;
};

export function BaseTable<TData extends WithDataTableRowId>({
  id,
  columns,
  data,
  initialSortingState,
  onSelect,
}: BaseTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(
    initialSortingState ?? [],
  );

  const tableOptions = useMemo((): TableOptions<TData> => {
    return {
      data: data ?? [],
      columns,
      getRowId: getRowIdFromRowId,
      state: { sorting },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
    };
  }, [columns, data, sorting]);

  // eslint-disable-next-line react-hooks/incompatible-library -- We use 'use no memo' on top of the file to handle this.
  const table = useReactTable<TData>(tableOptions);

  return (
    <div className="flex flex-col">
      {table.getHeaderGroups().map((headerGroup) => (
        <TableHeaderGroup headerGroup={headerGroup} key={headerGroup.id} />
      ))}

      {table.getRowModel().rows.map((row) => (
        <TableRow row={row} key={row.id} onSelect={onSelect} tableId={id} />
      ))}
    </div>
  );
}
