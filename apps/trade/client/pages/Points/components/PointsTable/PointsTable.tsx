'use client';

import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { bigNumberSortFn } from 'client/components/DataTable/utils/sortingFns';
import { NumberCell } from 'client/modules/tables/cells/NumberCell';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import {
  PointsTableItem,
  usePointsTable,
} from 'client/pages/Points/components/PointsTable/usePointsTable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<PointsTableItem>();

export function PointsTable({ className }: WithClassnames) {
  const { t } = useTranslation();

  const { data, isLoading } = usePointsTable();

  const columns: ColumnDef<PointsTableItem, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('epochDate', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.epoch)}</HeaderCell>
        ),
        cell: (context) => <TableCell>{context.getValue()}</TableCell>,
        meta: {
          cellContainerClassName: 'w-56',
        },
        sortingFn: 'basic',
      }),
      columnHelper.accessor('epochName', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.name)}</HeaderCell>
        ),
        cell: (context) => <TableCell>{context.getValue()}</TableCell>,
        meta: {
          cellContainerClassName: 'w-32',
        },
        enableSorting: false,
      }),
      columnHelper.accessor('points', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.points)}</HeaderCell>
        ),
        cell: (context) => (
          <NumberCell
            value={context.getValue()}
            formatSpecifier={PresetNumberFormatSpecifier.NUMBER_INT}
          />
        ),
        meta: {
          cellContainerClassName: 'w-40',
        },
        sortingFn: bigNumberSortFn,
      }),
      columnHelper.accessor('rank', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.rank)}</HeaderCell>
        ),
        cell: (context) => {
          const value = context.getValue();

          return value ? (
            <NumberCell
              value={context.getValue()}
              formatSpecifier={PresetNumberFormatSpecifier.NUMBER_INT}
            />
          ) : (
            <TableCell />
          );
        },
        meta: {
          cellContainerClassName: 'w-32',
        },
        sortingFn: 'basic',
      }),
      columnHelper.accessor('tierName', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.tier)}</HeaderCell>
        ),
        cell: (context) => <TableCell>{context.getValue()}</TableCell>,
        meta: {
          cellContainerClassName: 'w-32',
        },
      }),
    ];
  }, [t]);

  return (
    <DataTable
      columns={columns}
      data={data}
      pagination={undefined}
      isLoading={isLoading}
      tableContainerClassName={className}
      emptyState={<EmptyTablePlaceholder type="points_history" />}
    />
  );
}
