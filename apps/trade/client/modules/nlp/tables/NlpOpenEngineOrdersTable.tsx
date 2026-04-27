import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { bigNumberSortFn } from 'client/components/DataTable/utils/sortingFns';
import { useNlpOpenEngineOrdersTable } from 'client/modules/nlp/hooks/useNlpOpenEngineOrdersTable';
import { NlpOpenEngineOrdersTableItem } from 'client/modules/nlp/types/NlpOpenEngineOrdersTableItem';
import { DateTimeCell } from 'client/modules/tables/cells/DateTimeCell';
import { NumberCell } from 'client/modules/tables/cells/NumberCell';
import { OrderFilledTotalCell } from 'client/modules/tables/cells/OrderFilledTotalCell';
import { OrderIsReduceOnlyCell } from 'client/modules/tables/cells/OrderIsReduceOnlyCell';
import { OrderQuoteValueCell } from 'client/modules/tables/cells/OrderQuoteValueCell';
import { OrderDirectionLabel } from 'client/modules/tables/components/OrderDirectionLabel';
import { OrderMarketLabel } from 'client/modules/tables/components/OrderMarketLabel';
import { OrderTypeLabel } from 'client/modules/tables/components/OrderTypeLabel';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<NlpOpenEngineOrdersTableItem>();

export function NlpOpenEngineOrdersTable() {
  const { t } = useTranslation();

  const { orders, isLoading } = useNlpOpenEngineOrdersTable();

  const columns: ColumnDef<NlpOpenEngineOrdersTableItem, any>[] =
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
            <TableCell>
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
            <OrderIsReduceOnlyCell isReduceOnly={context.getValue()} />
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
            <DateTimeCell timestampMillis={context.getValue()} />
          ),
          sortingFn: 'basic',
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.time,
          },
        }),
      ];
    }, [t]);

  return (
    <DataTable
      columns={columns}
      data={orders}
      isLoading={isLoading}
      emptyState={<EmptyTablePlaceholder type="nlp_open_orders" />}
      pagination={undefined}
      largeScreenColumnPinning={{
        left: ['productName'],
      }}
    />
  );
}
