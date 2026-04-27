import { WithClassnames } from '@nadohq/web-common';
import { formatDurationMillis, TimeFormatSpecifier } from '@nadohq/web-ui';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { bigNumberSortFn } from 'client/components/DataTable/utils/sortingFns';
import { CancelAllOrdersHeaderCell } from 'client/modules/tables/cells/CancelAllOrdersHeaderCell';
import { CancelOrderCell } from 'client/modules/tables/cells/CancelOrderCell';
import { DateTimeCell } from 'client/modules/tables/cells/DateTimeCell';
import { NumberCell } from 'client/modules/tables/cells/NumberCell';
import { OrderFilledTotalCell } from 'client/modules/tables/cells/OrderFilledTotalCell';
import { OrderDirectionLabel } from 'client/modules/tables/components/OrderDirectionLabel';
import { OrderIsReduceOnly } from 'client/modules/tables/components/OrderIsReduceOnly';
import { OrderMarketLabel } from 'client/modules/tables/components/OrderMarketLabel';
import { TriggerOrderStatusDisplay } from 'client/modules/tables/components/TriggerOrderStatusDisplay';
import { ViewTwapExecutionsButton } from 'client/modules/tables/components/ViewTwapExecutionsButton';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { useOpenTimeTriggerOrdersTable } from 'client/modules/tables/openOrders/openTimeTriggerOrders/useOpenTimeTriggerOrdersTable';
import { OpenTimeTriggerOrderTableItem } from 'client/modules/tables/types/OpenTimeTriggerOrderTableItem';
import { TwapOrderRuntimeDisplay } from 'client/modules/trading/components/twap/TwapOrderRuntimeDisplay';
import { ORDER_DISPLAY_TYPES } from 'client/modules/trading/consts/orderDisplayTypes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  pageSize?: number;
  productIds?: number[];
}

const columnHelper = createColumnHelper<OpenTimeTriggerOrderTableItem>();

export function OpenTimeTriggerOrdersTable({
  className,
  pageSize,
  productIds,
}: WithClassnames<Props>) {
  const { t } = useTranslation();

  const { data, isLoading } = useOpenTimeTriggerOrdersTable({
    productIds,
  });

  const columns: ColumnDef<OpenTimeTriggerOrderTableItem, any>[] =
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
                marketName={context.getValue()}
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
        columnHelper.accessor('orderSide', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.direction)}</HeaderCell>
          ),
          cell: (context) => (
            <TableCell dataTestId="open-time-trigger-orders-table-order-direction">
              <OrderDirectionLabel
                orderSide={context.getValue()}
                productType={context.row.original.productType}
                isReduceOnly={context.row.original.isReduceOnly}
              />
            </TableCell>
          ),
          enableSorting: false,
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.orderSide,
          },
        }),
        columnHelper.accessor('filledAvgPrice', {
          header: ({ header }) => (
            <HeaderCell header={header}>
              {t(($) => $.avgFilledPrice)}
            </HeaderCell>
          ),
          cell: (context) => (
            <NumberCell
              dataTestId="open-time-trigger-orders-table-order-price"
              value={context.getValue()}
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
          cell: (context) => (
            <OrderFilledTotalCell
              filledBaseSize={context.getValue()}
              totalBaseSize={context.row.original.totalBaseSize}
              symbol={context.row.original.baseSymbol}
              formatSpecifier={context.row.original.formatSpecifier.size}
              dataTestId="open-time-trigger-orders-table-order-amount"
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
            <TableCell dataTestId="open-time-trigger-orders-table-reduce-only">
              <OrderIsReduceOnly isReduceOnly={context.getValue()} />
            </TableCell>
          ),
          sortingFn: 'basic',
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.isReduceOnly,
          },
        }),
        columnHelper.accessor('status', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.status)}</HeaderCell>
          ),
          cell: (context) => {
            const { digest } = context.row.original.orderForCancellation;
            return (
              <TableCell
                className="flex gap-x-1"
                dataTestId="open-time-trigger-orders-table-status"
              >
                <TriggerOrderStatusDisplay status={context.getValue()} />
                <ViewTwapExecutionsButton digest={digest} />
              </TableCell>
            );
          },
          sortingFn: 'basic',
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.status,
          },
        }),
        columnHelper.accessor('frequencyInMillis', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.frequency)}</HeaderCell>
          ),
          cell: (context) => (
            <TableCell dataTestId="open-time-trigger-orders-table-frequency">
              {formatDurationMillis(context.getValue(), {
                formatSpecifier: TimeFormatSpecifier.HH_MM_SS,
              })}
            </TableCell>
          ),
          sortingFn: 'basic',
          meta: {
            cellContainerClassName:
              TABLE_CELL_CONTAINER_CLASSNAME.twapFrequency,
          },
        }),
        columnHelper.accessor('totalRuntimeInMillis', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.runtimeTotal)}</HeaderCell>
          ),
          cell: (context) => (
            <TableCell dataTestId="open-time-trigger-orders-table-runtime">
              <TwapOrderRuntimeDisplay
                timePlacedMillis={context.row.original.timePlacedMillis}
                totalRuntimeInMillis={context.getValue()}
              />
            </TableCell>
          ),
          sortingFn: 'basic',
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.twapRuntime,
          },
        }),
        columnHelper.accessor('timePlacedMillis', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.time)}</HeaderCell>
          ),
          cell: (context) => (
            <DateTimeCell
              dataTestId="open-time-trigger-orders-table-time"
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
                orderDisplayTypes: ORDER_DISPLAY_TYPES.twap,
              }}
            />
          ),
          cell: (context) => {
            const { orderForCancellation } = context.row.original;
            return (
              <CancelOrderCell
                dataTestId="open-time-trigger-orders-table-cancel-order"
                order={orderForCancellation}
                key={orderForCancellation.digest}
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
      tableContainerClassName={className}
      autoPaginationPageSize={pageSize}
      pagination={undefined}
      largeScreenColumnPinning={{
        left: ['productName'],
        right: ['actions'],
      }}
      emptyState={<EmptyTablePlaceholder type="open_time_trigger_orders" />}
    />
  );
}
