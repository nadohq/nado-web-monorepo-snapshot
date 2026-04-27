import { WithClassnames } from '@nadohq/web-common';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { bigNumberSortFn } from 'client/components/DataTable/utils/sortingFns';
import { CancelAllOrdersHeaderCell } from 'client/modules/tables/cells/CancelAllOrdersHeaderCell';
import { CancelOrderCell } from 'client/modules/tables/cells/CancelOrderCell';
import { DateTimeCell } from 'client/modules/tables/cells/DateTimeCell';
import { EditOrderFilledTotalCell } from 'client/modules/tables/cells/EditOrderFilledTotalCell';
import { EditOrderPriceCell } from 'client/modules/tables/cells/EditOrderPriceCell';
import { OrderIsReduceOnlyCell } from 'client/modules/tables/cells/OrderIsReduceOnlyCell';
import { OrderQuoteValueCell } from 'client/modules/tables/cells/OrderQuoteValueCell';
import { OrderDirectionLabel } from 'client/modules/tables/components/OrderDirectionLabel';
import { OrderMarketLabel } from 'client/modules/tables/components/OrderMarketLabel';
import { OrderTypeLabel } from 'client/modules/tables/components/OrderTypeLabel';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { useOpenEngineOrdersTable } from 'client/modules/tables/openOrders/openEngineOrders/useOpenEngineOrdersTable';
import { OpenEngineOrderTableItem } from 'client/modules/tables/types/OpenEngineOrderTableItem';
import { ORDER_DISPLAY_TYPES } from 'client/modules/trading/consts/orderDisplayTypes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  pageSize?: number;
  productIds?: number[];
}

const columnHelper = createColumnHelper<OpenEngineOrderTableItem>();

export function OpenEngineOrdersTable({
  className,
  pageSize,
  productIds,
}: WithClassnames<Props>) {
  const { t } = useTranslation();

  const { data, isLoading } = useOpenEngineOrdersTable(productIds);

  const columns: ColumnDef<OpenEngineOrderTableItem, any>[] = useMemo(() => {
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
          <TableCell dataTestId="open-engine-orders-table-order-type">
            <OrderTypeLabel
              orderAppendix={context.getValue()}
              orderSide={context.row.original.orderSide}
              priceTriggerCriteria={undefined}
            />
          </TableCell>
        ),
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.orderType,
        },
      }),
      columnHelper.accessor('orderSide', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.direction)}</HeaderCell>
        ),
        cell: (context) => (
          <TableCell dataTestId="open-engine-orders-table-order-direction">
            <OrderDirectionLabel
              productType={context.row.original.productType}
              orderSide={context.getValue()}
              isReduceOnly={context.row.original.isReduceOnly}
            />
          </TableCell>
        ),
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.orderSide,
        },
      }),
      columnHelper.accessor('orderPrice', {
        header: ({ header }) => (
          <HeaderCell
            definitionTooltipId="openEngineOrdersLimitPrice"
            header={header}
          >
            {t(($) => $.orderPrice)}
          </HeaderCell>
        ),
        cell: (context) => (
          <EditOrderPriceCell
            currentValue={context.getValue()}
            formatSpecifier={context.row.original.formatSpecifier.price}
            dataTestId="open-engine-orders-table-order-price"
            productId={context.row.original.productId}
            digest={context.row.original.digest}
            isTrigger={false}
            field="orderPrice"
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
        cell: (context) => (
          <EditOrderFilledTotalCell
            filledBaseSize={context.getValue()}
            totalBaseAmount={context.row.original.totalBaseAmount}
            symbol={context.row.original.baseSymbol}
            formatSpecifier={context.row.original.formatSpecifier.size}
            dataTestId="open-engine-orders-table-filled-total"
            productId={context.row.original.productId}
            digest={context.row.original.digest}
            isTrigger={false}
            orderPrice={context.row.original.orderPrice}
          />
        ),
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName:
            TABLE_CELL_CONTAINER_CLASSNAME.amountWithSymbol,
        },
      }),
      columnHelper.accessor('totalQuoteSize', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.orderValue)}</HeaderCell>
        ),
        cell: (context) => (
          <OrderQuoteValueCell
            quoteSize={context.getValue()}
            quoteSymbol={context.row.original.quoteSymbol}
            isCloseEntirePosition={context.row.original.isCloseEntirePosition}
            isPrimaryQuote={context.row.original.isPrimaryQuote}
            dataTestId="open-engine-orders-table-order-value"
          />
        ),
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.accessor('isReduceOnly', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.reduceOnly)}</HeaderCell>
        ),
        cell: (context) => (
          <OrderIsReduceOnlyCell
            isReduceOnly={context.getValue()}
            dataTestId="open-engine-orders-table-reduce-only"
          />
        ),
        sortingFn: 'basic',
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.isReduceOnly,
        },
      }),
      columnHelper.accessor('timePlacedMillis', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.time)}</HeaderCell>
        ),
        cell: (context) => (
          <DateTimeCell
            timestampMillis={context.getValue()}
            dataTestId="open-engine-orders-table-time"
          />
        ),
        sortingFn: 'basic',
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.time,
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: ({ header }) => (
          <CancelAllOrdersHeaderCell
            header={header}
            cancelOrdersFilter={{
              productIds,
              orderDisplayTypes: ORDER_DISPLAY_TYPES.engine,
            }}
          />
        ),
        cell: (context) => {
          const { orderForCancellation } = context.row.original;
          return (
            <CancelOrderCell
              order={orderForCancellation}
              // Provide a key to force a unique render. Without this, React will somehow perserve the success state on previously cancelled order rows
              key={orderForCancellation.digest}
              dataTestId="open-engine-orders-table-cancel-order"
            />
          );
        },
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.actions,
        },
      }),
    ];
  }, [productIds, t]);

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyState={<EmptyTablePlaceholder type="open_limit_orders" />}
      tableContainerClassName={className}
      autoPaginationPageSize={pageSize}
      pagination={undefined}
      largeScreenColumnPinning={{
        left: ['productName'],
        right: ['actions'],
      }}
    />
  );
}
