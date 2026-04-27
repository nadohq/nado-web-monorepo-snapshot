import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { bigNumberSortFn } from 'client/components/DataTable/utils/sortingFns';
import { DateTimeCell } from 'client/modules/tables/cells/DateTimeCell';
import { OrderFilledPriceCell } from 'client/modules/tables/cells/OrderFilledPriceCell';
import { OrderFilledQuoteValueCell } from 'client/modules/tables/cells/OrderFilledQuoteValueCell';
import { OrderFilledTotalCell } from 'client/modules/tables/cells/OrderFilledTotalCell';
import { OrderIdCell } from 'client/modules/tables/cells/OrderIdCell';
import { OrderIsReduceOnlyCell } from 'client/modules/tables/cells/OrderIsReduceOnlyCell';
import { OrderQuoteValueCell } from 'client/modules/tables/cells/OrderQuoteValueCell';
import { OrderDirectionLabel } from 'client/modules/tables/components/OrderDirectionLabel';
import { OrderMarketLabel } from 'client/modules/tables/components/OrderMarketLabel';
import { OrderTypeLabel } from 'client/modules/tables/components/OrderTypeLabel';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { useHistoricalEngineOrdersTable } from 'client/modules/tables/historicalOrders/historicalEngineOrders/useHistoricalEngineOrdersTable';
import { HistoricalEngineOrderTableItem } from 'client/modules/tables/types/HistoricalEngineOrderTableItem';
import { ViewFullHistoryTableFooter } from 'client/modules/tables/ViewFullHistoryTableFooter';
import { isReversalFillEvent } from 'client/utils/isReversalFillEvent';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  pageSize: number;
  showPagination?: boolean;
  productIds?: number[];
}

const columnHelper = createColumnHelper<HistoricalEngineOrderTableItem>();

export function HistoricalEngineOrdersTable({
  pageSize,
  productIds,
  showPagination,
}: Props) {
  const { t } = useTranslation();

  const { mappedData, pagination, isLoading } = useHistoricalEngineOrdersTable({
    pageSize,
    productIds,
  });

  const columns: ColumnDef<HistoricalEngineOrderTableItem, any>[] =
    useMemo(() => {
      return [
        columnHelper.accessor('productName', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.market)}</HeaderCell>
          ),
          cell: (context) => (
            <TableCell>
              <OrderMarketLabel
                productId={context.row.original.productId}
                marketName={context.row.original.productName}
                orderSide={context.row.original.orderSide}
                isIso={context.row.original.isIsolated}
              />
            </TableCell>
          ),
          enableSorting: false,
          meta: {
            cellContainerClassName:
              TABLE_CELL_CONTAINER_CLASSNAME.productWithHighlight,
          },
        }),
        columnHelper.accessor('orderAppendix', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.orderType)}</HeaderCell>
          ),
          cell: (context) => (
            <TableCell>
              <OrderTypeLabel
                orderAppendix={context.getValue()}
                orderSide={context.row.original.orderSide}
                priceTriggerCriteria={undefined}
              />
            </TableCell>
          ),
          sortingFn: 'basic',
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.orderType,
          },
        }),
        columnHelper.accessor('orderSide', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.direction)}</HeaderCell>
          ),
          cell: (context) => (
            <TableCell>
              <OrderDirectionLabel
                productType={context.row.original.productType}
                orderSide={context.getValue()}
                isReduceOnly={context.row.original.isReduceOnly}
                isReversal={isReversalFillEvent(
                  context.row.original.closedBaseSize,
                  context.row.original.filledBaseSize,
                )}
              />
            </TableCell>
          ),
          sortingFn: 'basic',
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.orderSide,
          },
        }),
        columnHelper.accessor('filledAvgPrice', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.avgOrderPrice)}</HeaderCell>
          ),
          cell: (context) => (
            <OrderFilledPriceCell
              filledAvgPrice={context.getValue()}
              orderPrice={context.row.original.orderPrice}
              isMarket={context.row.original.isMarket}
              formatSpecifier={context.row.original.formatSpecifier.price}
            />
          ),
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.price,
          },
        }),
        columnHelper.accessor('filledBaseSize', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.filledTotal)}</HeaderCell>
          ),
          cell: (context) => {
            return (
              <OrderFilledTotalCell
                filledBaseSize={context.getValue()}
                totalBaseSize={context.row.original.totalBaseSize}
                symbol={context.row.original.baseSymbol}
                formatSpecifier={context.row.original.formatSpecifier.size}
              />
            );
          },
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
          },
        }),
        columnHelper.accessor('totalQuoteSize', {
          header: ({ header }) => (
            <HeaderCell header={header}>
              {t(($) => $.filledOrderValue)}
            </HeaderCell>
          ),
          cell: (context) => (
            <OrderFilledQuoteValueCell
              filledQuoteSize={context.row.original.filledQuoteSize}
              totalQuoteSize={context.getValue()}
              quoteSymbol={context.row.original.quoteSymbol}
              isCloseEntirePosition={context.row.original.isCloseEntirePosition}
              isPrimaryQuote={context.row.original.isPrimaryQuote}
              isMarket={context.row.original.isMarket}
            />
          ),
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.orderValue,
          },
        }),
        columnHelper.accessor('isReduceOnly', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.reduceOnly)}</HeaderCell>
          ),
          cell: (context) => (
            <OrderIsReduceOnlyCell isReduceOnly={context.getValue()} />
          ),
          sortingFn: 'basic',
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.isReduceOnly,
          },
        }),
        columnHelper.accessor('tradeFeeQuote', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.fees)}</HeaderCell>
          ),
          cell: (context) => (
            <OrderQuoteValueCell
              quoteSize={context.getValue()}
              quoteSymbol={context.row.original.quoteSymbol}
              isCloseEntirePosition={context.row.original.isCloseEntirePosition}
              isPrimaryQuote={context.row.original.isPrimaryQuote}
              isFee={true}
            />
          ),
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
          },
        }),
        columnHelper.accessor('lastFillTimeMillis', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.lastUpdated)}</HeaderCell>
          ),
          cell: (context) => (
            <DateTimeCell timestampMillis={context.getValue()} />
          ),
          sortingFn: 'basic',
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.time,
          },
        }),
        columnHelper.accessor('statusText', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.status)}</HeaderCell>
          ),
          cell: (context) => <TableCell>{context.getValue()}</TableCell>,
          sortingFn: 'basic',
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.status,
          },
        }),
        columnHelper.accessor('digest', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.orderIdAbbrev)}</HeaderCell>
          ),
          cell: (context) => <OrderIdCell orderId={context.getValue()} />,
          enableSorting: false,
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.orderId,
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
      largeScreenColumnPinning={{
        left: ['productName'],
      }}
      footer={
        !showPagination &&
        pagination.hasNextPage && <ViewFullHistoryTableFooter />
      }
      emptyState={<EmptyTablePlaceholder type="history_orders" />}
    />
  );
}
