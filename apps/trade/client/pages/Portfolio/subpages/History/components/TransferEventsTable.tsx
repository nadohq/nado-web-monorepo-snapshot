import { CustomNumberFormatSpecifier } from '@nadohq/react-client';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { MarketProductInfoCell } from 'client/components/DataTable/cells/MarketProductInfoCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { bigNumberSortFn } from 'client/components/DataTable/utils/sortingFns';
import { TransferCollateralEvent } from 'client/modules/events/collateral/types';
import { AmountWithSymbolCell } from 'client/modules/tables/cells/AmountWithSymbolCell';
import { CurrencyCell } from 'client/modules/tables/cells/CurrencyCell';
import { DateTimeCell } from 'client/modules/tables/cells/DateTimeCell';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { useTransferEventsTable } from 'client/pages/Portfolio/subpages/History/hooks/useTransferEventsTable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<TransferCollateralEvent>();

interface Props {
  pageSize: number;
  showPagination?: boolean;
}

export function TransferEventsTable({ pageSize, showPagination }: Props) {
  const { t } = useTranslation();

  const { mappedData, isLoading, pagination } = useTransferEventsTable({
    pageSize,
  });

  const columns: ColumnDef<TransferCollateralEvent, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('timestampMillis', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.time)}</HeaderCell>
        ),
        cell: (context) => (
          <DateTimeCell timestampMillis={context.getValue()} />
        ),
        sortingFn: 'basic',
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.time,
        },
      }),
      columnHelper.accessor('token', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.asset)}</HeaderCell>
        ),
        cell: (context) => {
          const token = context.getValue<TransferCollateralEvent['token']>();
          return (
            <MarketProductInfoCell
              symbol={token.symbol}
              iconSrc={token.icon.asset}
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.product,
        },
      }),
      columnHelper.accessor('fromSubaccount.username', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.from)}</HeaderCell>
        ),
        cell: (context) => <TableCell>{context.getValue()}</TableCell>,
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.username,
        },
      }),
      columnHelper.accessor('toSubaccount.username', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.to)}</HeaderCell>
        ),
        cell: (context) => <TableCell>{context.getValue()}</TableCell>,
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.username,
        },
      }),
      columnHelper.accessor('amount', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.balanceChange)}</HeaderCell>
        ),
        cell: (context) => (
          <AmountWithSymbolCell
            amount={context.getValue()}
            symbol={context.row.original.token.symbol}
            formatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
          />
        ),
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.accessor('valueUsd', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.value)}</HeaderCell>
        ),
        cell: (context) => <CurrencyCell value={context.getValue()} />,
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
      data={mappedData}
      isLoading={isLoading}
      pagination={showPagination ? pagination : undefined}
      emptyState={<EmptyTablePlaceholder type="history_transfers" />}
    />
  );
}
