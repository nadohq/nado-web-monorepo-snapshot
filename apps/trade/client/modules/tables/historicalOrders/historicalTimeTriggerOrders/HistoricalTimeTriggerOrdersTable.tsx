import { formatDurationMillis, TimeFormatSpecifier } from '@nadohq/web-ui';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { bigNumberSortFn } from 'client/components/DataTable/utils/sortingFns';
import { DateTimeCell } from 'client/modules/tables/cells/DateTimeCell';
import { NumberCell } from 'client/modules/tables/cells/NumberCell';
import { OrderFilledTotalCell } from 'client/modules/tables/cells/OrderFilledTotalCell';
import { OrderIdCell } from 'client/modules/tables/cells/OrderIdCell';
import { OrderDirectionLabel } from 'client/modules/tables/components/OrderDirectionLabel';
import { OrderIsReduceOnly } from 'client/modules/tables/components/OrderIsReduceOnly';
import { OrderMarketLabel } from 'client/modules/tables/components/OrderMarketLabel';
import { TriggerOrderStatusDisplay } from 'client/modules/tables/components/TriggerOrderStatusDisplay';
import { ViewTwapExecutionsButton } from 'client/modules/tables/components/ViewTwapExecutionsButton';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { useHistoricalTimeTriggerOrdersTable } from 'client/modules/tables/historicalOrders/historicalTimeTriggerOrders/useHistoricalTimeTriggerOrdersTable';
import { HistoricalTimeTriggerOrdersTableItem } from 'client/modules/tables/types/HistoricalTimeTriggerOrderTableItem';
import { isReversalFillEvent } from 'client/utils/isReversalFillEvent';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  pageSize: number;
  showPagination?: boolean;
  productIds?: number[];
}

const columnHelper = createColumnHelper<HistoricalTimeTriggerOrdersTableItem>();

export function HistoricalTimeTriggerOrdersTable({
  pageSize,
  productIds,
  showPagination,
}: Props) {
  const { t } = useTranslation();

  const { mappedData, pagination, isLoading } =
    useHistoricalTimeTriggerOrdersTable({
      pageSize,
      productIds,
    });

  const columns: ColumnDef<HistoricalTimeTriggerOrdersTableItem, any>[] =
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
            <TableCell>
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
          cell: (context) => (
            <TableCell className="flex gap-x-1">
              <TriggerOrderStatusDisplay status={context.getValue()} />
              <ViewTwapExecutionsButton digest={context.row.original.digest} />
            </TableCell>
          ),
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
            <TableCell>
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
            <HeaderCell header={header}>{t(($) => $.twapRuntime)}</HeaderCell>
          ),
          cell: (context) => {
            return (
              <TableCell>
                {formatDurationMillis(context.getValue(), {
                  formatSpecifier: TimeFormatSpecifier.HH_MM_SS,
                })}
              </TableCell>
            );
          },
          sortingFn: 'basic',
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.twapRuntime,
          },
        }),
        columnHelper.accessor('timeUpdatedMillis', {
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
      emptyState={<EmptyTablePlaceholder type="history_trigger_orders" />}
    />
  );
}
