// TanStack Table's useReactTable() API returns functions that cannot be memoized safely, so we use 'use no memo'.
// https://github.com/TanStack/table/issues/5567
'use no memo';
import { useSizeClass } from '@nadohq/web-ui';
import {
  ColumnDef,
  ColumnOrderState,
  ColumnPinningState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  TableOptions,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import {
  DataTablePagination,
  DataTableState,
  WithDataTableRowId,
} from 'client/components/DataTable/types';
import { getRowIdFromRowId } from 'client/components/DataTable/utils/getRowIdFromRowId';
import { useMemo, useState } from 'react';

export interface UseDataTableParams<TData extends WithDataTableRowId> {
  data: TData[] | undefined;
  columns: ColumnDef<TData, any>[];
  columnOrder?: ColumnOrderState;
  columnVisibility?: VisibilityState;
  /** Auto pagination - if this is set, the table will automatically paginate based on the given page size. */
  autoPaginationPageSize?: number;
  /** Manual pagination - if this is not set, the table has no pagination. */
  pagination: DataTablePagination | undefined;
  largeScreenColumnPinning?: ColumnPinningState;
  isLoading: boolean;
}

/**
 * A hook that provides a table instance and state.
 * @param params - The parameters for the hook.
 * @returns The table instance and state.
 */
export function useDataTable<TData extends WithDataTableRowId>({
  columns,
  data,
  isLoading,
  autoPaginationPageSize,
  pagination,
  columnOrder,
  columnVisibility,
  largeScreenColumnPinning,
}: UseDataTableParams<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [autoPaginationState, setAutoPaginationState] =
    useState<PaginationState>({
      pageIndex: 0,
      pageSize: autoPaginationPageSize ?? 0,
    });
  const { isMobile } = useSizeClass();

  const isAutoPaginated = autoPaginationPageSize != null;

  const {
    paginationState: manualPaginationState,
    setPaginationState: setManualPaginationState,
    pageCount,
  } = pagination ?? {};

  const isManuallyPaginated =
    manualPaginationState != null && setManualPaginationState != null;
  const isPaginated = isManuallyPaginated || isAutoPaginated;

  const { paginationState, setPaginationState } = (() => {
    if (!isPaginated || !data) {
      return {
        paginationState: undefined,
        setPaginationState: undefined,
      };
    }
    if (isManuallyPaginated) {
      return {
        paginationState: manualPaginationState,
        setPaginationState: setManualPaginationState,
      };
    } else {
      return {
        paginationState: autoPaginationState,
        setPaginationState: setAutoPaginationState,
      };
    }
  })();

  const tableOptions = useMemo((): TableOptions<TData> => {
    return {
      data: data ?? [],
      columns,
      getRowId: getRowIdFromRowId,
      state: {
        sorting,
        columnOrder,
        columnVisibility,
        pagination: paginationState,
        // Disable column pinning on mobile
        columnPinning: isMobile ? {} : (largeScreenColumnPinning ?? {}),
      },
      pageCount,
      onPaginationChange: setPaginationState,
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      // Prevents pagination from resetting to page 0 when data updates
      autoResetPageIndex: isAutoPaginated ? false : undefined,
      getPaginationRowModel: isAutoPaginated
        ? getPaginationRowModel()
        : undefined,
      manualPagination: isManuallyPaginated,
    };
  }, [
    columnOrder,
    columnVisibility,
    columns,
    data,
    isAutoPaginated,
    isManuallyPaginated,
    pageCount,
    paginationState,
    setPaginationState,
    sorting,
    largeScreenColumnPinning,
    isMobile,
  ]);

  // eslint-disable-next-line react-hooks/incompatible-library -- We use 'use no memo' on top of the file to handle this.
  const table = useReactTable<TData>(tableOptions);

  const tableState: DataTableState = useMemo(() => {
    if (isLoading) {
      return 'loading';
    } else if (data?.length) {
      return 'filled';
    }
    return 'empty';
  }, [data?.length, isLoading]);

  return {
    table,
    tableState,
    paginationState,
  };
}
