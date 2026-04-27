import { WithClassnames } from '@nadohq/web-common';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { bigNumberSortFn } from 'client/components/DataTable/utils/sortingFns';
import { CancelAllOrdersHeaderCell } from 'client/modules/tables/cells/CancelAllOrdersHeaderCell';
import { CancelOrderCell } from 'client/modules/tables/cells/CancelOrderCell';
import { DateTimeCell } from 'client/modules/tables/cells/DateTimeCell';
import { EditOrderAmountCell } from 'client/modules/tables/cells/EditOrderAmountCell';
import { OrderIsReduceOnlyCell } from 'client/modules/tables/cells/OrderIsReduceOnlyCell';
import { OrderQuoteValueCell } from 'client/modules/tables/cells/OrderQuoteValueCell';
import { OrderDirectionLabel } from 'client/modules/tables/components/OrderDirectionLabel';
import { OrderMarketLabel } from 'client/modules/tables/components/OrderMarketLabel';
import { OrderPrice } from 'client/modules/tables/components/OrderPrice';
import { OrderPriceTriggerCondition } from 'client/modules/tables/components/OrderPriceTriggerCondition';
import { OrderTypeLabel } from 'client/modules/tables/components/OrderTypeLabel';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { useOpenPriceTriggerOrdersTable } from 'client/modules/tables/openOrders/openPriceTriggerOrders/useOpenPriceTriggerOrdersTable';
import { OpenPriceTriggerOrderTableItem } from 'client/modules/tables/types/OpenPriceTriggerOrderTableItem';
import { PriceTriggerOrderDisplayType } from 'client/modules/trading/types/orderDisplayTypes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  triggerOrderDisplayTypes?: PriceTriggerOrderDisplayType[];
  pageSize?: number;
  productIds?: number[];
}

const columnHelper = createColumnHelper<OpenPriceTriggerOrderTableItem>();

export function OpenPriceTriggerOrdersTable({
  className,
  triggerOrderDisplayTypes,
  pageSize,
  productIds,
}: WithClassnames<Props>) {
  const { t } = useTranslation();

  const { data, isLoading } = useOpenPriceTriggerOrdersTable({
    productIds,
    triggerOrderDisplayTypes,
  });

  const columns: ColumnDef<OpenPriceTriggerOrderTableItem, any>[] =
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
          cell: (context) => {
            return (
              <TableCell dataTestId="open-price-trigger-orders-table-order-type">
                <OrderTypeLabel
                  orderSide={context.row.original.orderSide}
                  orderAppendix={context.getValue()}
                  priceTriggerCriteria={
                    context.row.original.priceTriggerCriteria
                  }
                />
              </TableCell>
            );
          },
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
            <HeaderCell header={header}>{t(($) => $.orderPrice)}</HeaderCell>
          ),
          cell: (context) => (
            <TableCell dataTestId="open-price-trigger-orders-table-order-price">
              <OrderPrice
                isMarket={context.row.original.isMarket}
                orderPrice={context.getValue()}
                formatSpecifier={context.row.original.formatSpecifier.price}
              />
            </TableCell>
          ),
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.price,
          },
        }),
        columnHelper.accessor('totalBaseAmount', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.amount)}</HeaderCell>
          ),
          cell: (context) =>
            context.row.original.isCloseEntirePosition ? (
              <TableCell dataTestId="open-price-trigger-orders-table-order-amount">
                {t(($) => $.entirePosition)}
              </TableCell>
            ) : (
              <EditOrderAmountCell
                dataTestId="open-price-trigger-orders-table-order-amount"
                amount={context.getValue()}
                formatSpecifier={context.row.original.formatSpecifier.size}
                symbol={context.row.original.baseSymbol}
                productId={context.row.original.productId}
                digest={context.row.original.digest}
                isTrigger={true}
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
              dataTestId="open-price-trigger-orders-table-order-value"
              quoteSize={context.getValue()}
              quoteSymbol={context.row.original.quoteSymbol}
              isCloseEntirePosition={context.row.original.isCloseEntirePosition}
              isPrimaryQuote={context.row.original.isPrimaryQuote}
            />
          ),
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
          },
        }),
        columnHelper.accessor('priceTriggerCriteria', {
          header: ({ header }) => (
            <HeaderCell header={header}>
              {t(($) => $.triggerCondition)}
            </HeaderCell>
          ),
          cell: (context) => (
            <TableCell dataTestId="open-price-trigger-orders-table-trigger-condition">
              <OrderPriceTriggerCondition
                formatSpecifier={context.row.original.formatSpecifier.price}
                priceTriggerCriteria={context.getValue()}
              />
            </TableCell>
          ),
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName:
              TABLE_CELL_CONTAINER_CLASSNAME.triggerCondition,
          },
        }),
        columnHelper.accessor('isReduceOnly', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.reduceOnly)}</HeaderCell>
          ),
          cell: (context) => (
            <OrderIsReduceOnlyCell
              dataTestId="open-price-trigger-orders-table-reduce-only"
              isReduceOnly={context.getValue()}
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
              dataTestId="open-price-trigger-orders-table-time"
              timestampMillis={context.getValue()}
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
                orderDisplayTypes: triggerOrderDisplayTypes,
              }}
            />
          ),
          cell: (context) => {
            const { orderForCancellation } = context.row.original;
            return (
              <CancelOrderCell
                dataTestId="open-price-trigger-orders-table-cancel-order"
                order={orderForCancellation}
                // Provide a key to force a unique render. Without this, React will somehow perserve the success state on previously cancelled order rows
                key={orderForCancellation.digest}
              />
            );
          },
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.actions,
          },
        }),
      ];
    }, [productIds, triggerOrderDisplayTypes, t]);

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      tableContainerClassName={className}
      autoPaginationPageSize={pageSize}
      pagination={undefined}
      largeScreenColumnPinning={{
        left: ['productName'],
        right: ['actions'],
      }}
      emptyState={<EmptyTablePlaceholder type="open_price_trigger_orders" />}
    />
  );
}
