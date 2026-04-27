import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { AmountWithSymbolCell } from 'client/modules/tables/cells/AmountWithSymbolCell';
import { CurrencyCell } from 'client/modules/tables/cells/CurrencyCell';
import { DateTimeCell } from 'client/modules/tables/cells/DateTimeCell';
import { PercentageCell } from 'client/modules/tables/cells/PercentageCell';
import { PerpPositionLabel } from 'client/modules/tables/components/PerpPositionLabel';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { useFundingPaymentsTable } from 'client/modules/tables/historicalFunding/useFundingPaymentsTable';
import { FundingPaymentsTableItem } from 'client/modules/tables/types/FundingPaymentsTableItem';
import { ViewFullHistoryTableFooter } from 'client/modules/tables/ViewFullHistoryTableFooter';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  pageSize: number;
  showPagination?: boolean;
  productIds?: number[];
}

const columnHelper = createColumnHelper<FundingPaymentsTableItem>();

export const PaginatedFundingPaymentsTable = ({
  pageSize,
  showPagination,
  productIds,
  className,
}: Props) => {
  const { t } = useTranslation();

  const { mappedData, isLoading, pagination } = useFundingPaymentsTable({
    pageSize,
    productIds,
  });

  const columns: ColumnDef<FundingPaymentsTableItem, any>[] = useMemo(() => {
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
      columnHelper.accessor('productName', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.market)}</HeaderCell>
        ),
        cell: (context) => {
          return (
            <TableCell>
              <PerpPositionLabel
                productId={context.row.original.productId}
                marketName={context.row.original.productName}
                amountForSide={context.row.original.positionAmount}
                marginModeType={context.row.original.marginModeType}
              />
            </TableCell>
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.product,
        },
      }),
      columnHelper.accessor('positionSize', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.positionSize)}</HeaderCell>
        ),
        cell: (context) => {
          return (
            <AmountWithSymbolCell
              amount={context.getValue()}
              symbol={context.row.original.baseSymbol}
              formatSpecifier={context.row.original.formatSpecifier.size}
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName:
            TABLE_CELL_CONTAINER_CLASSNAME.amountWithSymbol,
        },
      }),
      columnHelper.accessor('fundingPaymentQuote', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.payment)}</HeaderCell>
        ),
        cell: (context) => {
          const fundingPaymentQuote =
            context.getValue<FundingPaymentsTableItem['fundingPaymentQuote']>();
          return (
            <CurrencyCell
              className={getSignDependentColorClassName(fundingPaymentQuote)}
              value={fundingPaymentQuote}
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.accessor('fundingRateFrac', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.fundingRate)}</HeaderCell>
        ),
        cell: (context) => {
          const fundingRateFrac =
            context.getValue<FundingPaymentsTableItem['fundingRateFrac']>();
          return (
            <PercentageCell
              className={getSignDependentColorClassName(fundingRateFrac)}
              fraction={fundingRateFrac}
              formatSpecifier={
                PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_4DP
              }
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.percentage,
        },
      }),
    ];
  }, [t]);

  return (
    <DataTable
      columns={columns}
      data={mappedData}
      isLoading={isLoading}
      tableContainerClassName={className}
      pagination={showPagination ? pagination : undefined}
      footer={
        !showPagination &&
        pagination.hasNextPage && <ViewFullHistoryTableFooter />
      }
      emptyState={<EmptyTablePlaceholder type="history_funding_payments" />}
    />
  );
};
