'use client';

import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { MarketProductInfoCell } from 'client/components/DataTable/cells/MarketProductInfoCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { bigNumberSortFn } from 'client/components/DataTable/utils/sortingFns';
import { AmountWithSymbolCell } from 'client/modules/tables/cells/AmountWithSymbolCell';
import { PnlCell } from 'client/modules/tables/cells/PnlCell';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import {
  TradingSpreadTableItem,
  useTradingSpreadsTable,
} from 'client/modules/tables/spreads/useTradingSpreadsTable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<TradingSpreadTableItem>();

interface Props {
  productIds?: number[];
}

export function TradingSpreadsTable({ productIds }: Props) {
  const { t } = useTranslation();
  const { data: spreads, isLoading } = useTradingSpreadsTable({ productIds });

  const columns: ColumnDef<TradingSpreadTableItem, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('metadata', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.spreads)}</HeaderCell>
        ),
        cell: ({ getValue }) => {
          const metadata = getValue<TradingSpreadTableItem['metadata']>();
          return (
            <MarketProductInfoCell
              symbol={metadata.symbol}
              iconSrc={metadata.icon.asset}
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.product,
        },
      }),
      columnHelper.accessor('spotAmount', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.spotPosition)}</HeaderCell>
        ),
        cell: (context) => {
          const { symbol } = context.row.original.spotMetadata.token;
          return (
            <AmountWithSymbolCell
              amount={context.getValue()}
              symbol={symbol}
              formatSpecifier={context.row.original.sizeFormatSpecifier}
            />
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName:
            TABLE_CELL_CONTAINER_CLASSNAME.amountWithSymbol,
        },
      }),
      columnHelper.accessor('perpAmount', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.perpPosition)}</HeaderCell>
        ),
        cell: (context) => {
          const { symbol } = context.row.original.metadata;
          return (
            <AmountWithSymbolCell
              amount={context.getValue()}
              symbol={symbol}
              formatSpecifier={context.row.original.sizeFormatSpecifier}
            />
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName:
            TABLE_CELL_CONTAINER_CLASSNAME.amountWithSymbol,
        },
      }),
      columnHelper.accessor('spotPnlUsd', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.spotPnl)}</HeaderCell>
        ),
        cell: (context) => <PnlCell value={context.getValue()} />,
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.accessor('perpPnlUsd', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.perpPnl)}</HeaderCell>
        ),
        cell: (context) => <PnlCell value={context.getValue()} />,
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.accessor('fundingUsd', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.funding)}</HeaderCell>
        ),
        cell: (context) => <PnlCell value={context.getValue()} />,
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.accessor('interestUsd', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.interest)}</HeaderCell>
        ),
        cell: (context) => <PnlCell value={context.getValue()} />,
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.accessor('netPnlUsd', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.netPnl)}</HeaderCell>
        ),
        cell: (context) => <PnlCell value={context.getValue()} />,
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
    ];
  }, [t]);

  return (
    <DataTable
      columns={columns}
      data={spreads}
      isLoading={isLoading}
      pagination={undefined}
      largeScreenColumnPinning={{
        left: ['metadata'],
      }}
      emptyState={<EmptyTablePlaceholder type="spreads" />}
    />
  );
}
