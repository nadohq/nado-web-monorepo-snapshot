'use client';

import { joinClassNames } from '@nadohq/web-common';
import { CARD_PADDING_CLASSNAMES } from '@nadohq/web-ui';
import { DataTableLayout } from 'client/components/DataTable/components/DataTableLayout';
import {
  useDataTable,
  UseDataTableParams,
} from 'client/components/DataTable/hooks/useDataTable';
import { Pagination } from 'client/components/DataTable/Pagination';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { SpinnerContainer } from 'client/components/SpinnerContainer';
import { ReactNode } from 'react';

export interface DataTableProps<
  TData extends WithDataTableRowId,
> extends UseDataTableParams<TData> {
  tableContainerClassName?: string;
  tableClassName?: string;
  headerRowClassName?: string;
  dataRowClassName?: string;
  dataRowContainerClassName?: string;
  emptyState: ReactNode | undefined;
  fitDataRowHeight?: boolean;

  /** Table footer (eg. link to separate table with pagination) */
  footer?: ReactNode;
}

export function DataTable<TData extends WithDataTableRowId>({
  columns,
  isLoading,
  data,
  emptyState,
  columnOrder,
  columnVisibility,
  largeScreenColumnPinning,
  autoPaginationPageSize,
  pagination,
  footer,
  tableClassName,
  tableContainerClassName,
  headerRowClassName,
  fitDataRowHeight,
  dataRowContainerClassName,
  dataRowClassName,
}: DataTableProps<TData>) {
  const {
    table,
    tableState,
    paginationState: tablePaginationState,
  } = useDataTable({
    columns,
    data,
    isLoading,
    autoPaginationPageSize,
    pagination,
    columnOrder,
    columnVisibility,
    largeScreenColumnPinning,
  });

  const tableContent = (() => {
    if (tableState === 'loading') {
      return <SpinnerContainer />;
    }

    return (
      <DataTableLayout
        table={table}
        headerRowClassName={headerRowClassName}
        dataRowContainerClassName={dataRowContainerClassName}
        dataRowClassName={dataRowClassName}
        fitDataRowHeight={fitDataRowHeight}
      />
    );
  })();

  // `tablePaginationState` is naturally undefined when pagination is disabled. Additionally, without this check,
  // table.getState().pagination will throw because pagination is undefined.
  // Show pagination if there's data OR if we're past the first page (so user can navigate back even on an empty page).
  const showPagination =
    !!tablePaginationState &&
    Boolean(data?.length || tablePaginationState?.pageIndex > 0);

  return (
    <div className={tableContainerClassName}>
      {/* Table */}
      <div className={tableClassName}>
        {tableContent}
        {tableState === 'empty' && emptyState}
        {footer}
      </div>
      {/*Pagination*/}
      {showPagination && (
        <div
          className={joinClassNames(
            'flex w-full justify-end',
            'pt-3',
            CARD_PADDING_CLASSNAMES.horizontal,
          )}
        >
          <Pagination
            pageIndex={table.getState().pagination.pageIndex}
            canPreviousPage={table.getCanPreviousPage()}
            canNextPage={table.getCanNextPage()}
            previousPage={table.previousPage}
            nextPage={table.nextPage}
          />
        </div>
      )}
    </div>
  );
}
