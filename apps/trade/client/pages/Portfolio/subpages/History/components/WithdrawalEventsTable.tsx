import { CustomNumberFormatSpecifier } from '@nadohq/react-client';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { MarketProductInfoCell } from 'client/components/DataTable/cells/MarketProductInfoCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { bigNumberSortFn } from 'client/components/DataTable/utils/sortingFns';
import { WithdrawCollateralEvent } from 'client/modules/events/collateral/types';
import { AmountWithSymbolCell } from 'client/modules/tables/cells/AmountWithSymbolCell';
import { CurrencyCell } from 'client/modules/tables/cells/CurrencyCell';
import { DateTimeCell } from 'client/modules/tables/cells/DateTimeCell';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { WithdrawalStatusCell } from 'client/pages/Portfolio/subpages/History/components/cells/WithdrawalStatusCell';
import { useWithdrawalEventsTable } from 'client/pages/Portfolio/subpages/History/hooks/useWithdrawalEventsTable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<WithdrawCollateralEvent>();

interface Props {
  pageSize: number;
  showPagination?: boolean;
}

export function WithdrawalEventsTable({ pageSize, showPagination }: Props) {
  const { t } = useTranslation();

  const { mappedData, pagination, isLoading } = useWithdrawalEventsTable({
    pageSize,
  });

  const columns: ColumnDef<WithdrawCollateralEvent, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('timestampMillis', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.time)}</HeaderCell>
        ),
        cell: (context) => (
          <DateTimeCell
            timestampMillis={context.getValue()}
            dataTestId="withdrawal-history-table-time"
          />
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
          const metadata = context.getValue<WithdrawCollateralEvent['token']>();
          return (
            <MarketProductInfoCell
              symbol={metadata.symbol}
              iconSrc={metadata.icon.asset}
              dataTestId="withdrawal-history-table-asset"
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.product,
        },
      }),
      columnHelper.accessor('size', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.amount)}</HeaderCell>
        ),
        cell: (context) => (
          <AmountWithSymbolCell
            amount={context.getValue()}
            symbol={context.row.original.token.symbol}
            formatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
            dataTestId="withdrawal-history-table-amount"
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
        cell: (context) => (
          <CurrencyCell
            value={context.getValue()}
            dataTestId="withdrawal-history-table-value"
          />
        ),
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.accessor('isProcessing', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.status)}</HeaderCell>
        ),
        cell: (context) => {
          const isProcessing =
            context.getValue<WithdrawCollateralEvent['isProcessing']>();

          const {
            productId,
            submissionIndex,
            amount,
            hasWithdrawPoolLiquidity,
          } = context.row.original;
          return (
            <WithdrawalStatusCell
              isProcessing={isProcessing}
              hasWithdrawPoolLiquidity={hasWithdrawPoolLiquidity}
              productId={productId}
              submissionIndex={submissionIndex}
              amount={amount}
              dataTestId="withdrawal-history-table-status"
            />
          );
        },
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.status,
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
      emptyState={<EmptyTablePlaceholder type="history_withdrawals" />}
    />
  );
}
