import { CustomNumberFormatSpecifier } from '@nadohq/react-client';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { MarketProductInfoCell } from 'client/components/DataTable/cells/MarketProductInfoCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { bigNumberSortFn } from 'client/components/DataTable/utils/sortingFns';
import { AmountWithSymbolCell } from 'client/modules/tables/cells/AmountWithSymbolCell';
import { DateTimeCell } from 'client/modules/tables/cells/DateTimeCell';
import { PercentageCell } from 'client/modules/tables/cells/PercentageCell';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import {
  InterestPaymentsTableItem,
  useInterestPaymentsTable,
} from 'client/modules/tables/interestPayments/useInterestPaymentsTable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<InterestPaymentsTableItem>();

interface Props {
  pageSize: number;
  showPagination?: boolean;
}

export const PaginatedInterestPaymentsTable = ({
  pageSize,
  showPagination,
}: Props) => {
  const { t } = useTranslation();

  const { mappedData, pagination, isLoading } = useInterestPaymentsTable({
    pageSize,
  });

  const columns: ColumnDef<InterestPaymentsTableItem, any>[] = useMemo(() => {
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
      columnHelper.accessor('metadata', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.asset)}</HeaderCell>
        ),
        cell: ({ getValue }) => {
          const {
            token: { symbol, icon },
          } = getValue<InterestPaymentsTableItem['metadata']>();
          return <MarketProductInfoCell symbol={symbol} iconSrc={icon.asset} />;
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.product,
        },
      }),
      columnHelper.accessor('balanceAmount', {
        header: ({ header }) => (
          <HeaderCell definitionTooltipId="assetBalance" header={header}>
            {t(($) => $.balance)}
          </HeaderCell>
        ),
        cell: (context) => {
          const amount =
            context.getValue<InterestPaymentsTableItem['balanceAmount']>();
          const symbol = context.row.original.metadata.token.symbol;
          return (
            <AmountWithSymbolCell
              amount={amount}
              symbol={symbol}
              formatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
            />
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName:
            TABLE_CELL_CONTAINER_CLASSNAME.amountWithSymbol,
        },
      }),
      columnHelper.accessor('interestRateFrac', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.interestRate)}</HeaderCell>
        ),
        cell: (context) => {
          const fraction =
            context.getValue<InterestPaymentsTableItem['interestRateFrac']>();
          return <PercentageCell fraction={fraction} />;
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.percentage,
        },
      }),
      columnHelper.accessor('interestPaidAmount', {
        header: ({ header }) => (
          <HeaderCell definitionTooltipId="interestPayment" header={header}>
            {t(($) => $.interestPayment)}
          </HeaderCell>
        ),
        cell: (context) => {
          const amount =
            context.getValue<InterestPaymentsTableItem['interestPaidAmount']>();
          const symbol = context.row.original.metadata.token.symbol;
          return (
            <AmountWithSymbolCell
              amount={amount}
              symbol={symbol}
              formatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
            />
          );
        },
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
      largeScreenColumnPinning={undefined}
      pagination={showPagination ? pagination : undefined}
      emptyState={<EmptyTablePlaceholder type="history_interest_payments" />}
    />
  );
};
