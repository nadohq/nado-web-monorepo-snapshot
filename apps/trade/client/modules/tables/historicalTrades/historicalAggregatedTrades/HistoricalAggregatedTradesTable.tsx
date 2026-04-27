import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import {
  bigNumberSortFn,
  getKeyedBigNumberSortFn,
} from 'client/components/DataTable/utils/sortingFns';
import { PnlValueWithPercentage } from 'client/components/PnlValueWithPercentage';
import { AmountWithSymbolCell } from 'client/modules/tables/cells/AmountWithSymbolCell';
import { DateTimeCell } from 'client/modules/tables/cells/DateTimeCell';
import { NumberCell } from 'client/modules/tables/cells/NumberCell';
import { OrderIdCell } from 'client/modules/tables/cells/OrderIdCell';
import { OrderQuoteValueCell } from 'client/modules/tables/cells/OrderQuoteValueCell';
import { OrderDirectionLabel } from 'client/modules/tables/components/OrderDirectionLabel';
import { OrderMarketLabel } from 'client/modules/tables/components/OrderMarketLabel';
import { PerpPnlShareButton } from 'client/modules/tables/components/PerpPnlShareButton';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { useHistoricalAggregatedTradesTable } from 'client/modules/tables/historicalTrades/historicalAggregatedTrades/useHistoricalAggregatedTradesTable';
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

export function HistoricalAggregatedTradesTable({
  pageSize,
  productIds,
  showPagination,
}: Props) {
  const { t } = useTranslation();

  const { mappedData, pagination, isLoading } =
    useHistoricalAggregatedTradesTable({
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
            <HeaderCell header={header}>{t(($) => $.price)}</HeaderCell>
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
            <HeaderCell header={header}>{t(($) => $.size)}</HeaderCell>
          ),
          cell: (context) => (
            <AmountWithSymbolCell
              amount={context.getValue()}
              symbol={context.row.original.baseSymbol}
              formatSpecifier={context.row.original.formatSpecifier.size}
            />
          ),
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName:
              TABLE_CELL_CONTAINER_CLASSNAME.amountWithSymbol,
          },
        }),
        columnHelper.accessor('filledQuoteSize', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.tradeValue)}</HeaderCell>
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
        columnHelper.accessor('realizedPnl', {
          header: ({ header }) => (
            <HeaderCell definitionTooltipId="realizedPnl" header={header}>
              {t(($) => $.realizedPnl)}
            </HeaderCell>
          ),
          cell: (context) => {
            const {
              productId,
              isPerp,
              filledAvgPrice: exitPrice,
              marginModeType,
              isoLeverage,
              realizedPnl,
              preClosePositionAmount,
              entryPrice,
            } = context.row.original;
            const isPerpWithRealizedPnl = isPerp && realizedPnl;

            return (
              <TableCell className="flex items-center gap-x-2">
                <PnlValueWithPercentage
                  className="flex flex-col gap-y-1.5"
                  pnlUsd={realizedPnl?.pnlUsd}
                  pnlFrac={realizedPnl?.pnlFrac}
                />
                {isPerpWithRealizedPnl && (
                  <PerpPnlShareButton
                    productId={productId}
                    positionAmount={preClosePositionAmount}
                    pnlFrac={realizedPnl.pnlFrac}
                    pnlUsd={realizedPnl.pnlUsd}
                    entryPrice={entryPrice}
                    referencePrice={exitPrice}
                    referencePriceLabel={t(($) => $.exitPrice)}
                    marginModeType={marginModeType}
                    isoLeverage={isoLeverage}
                  />
                )}
              </TableCell>
            );
          },
          sortingFn: getKeyedBigNumberSortFn('pnlUsd'),
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.pnl,
          },
        }),
        columnHelper.accessor('tradeFeeQuote', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.fee)}</HeaderCell>
          ),
          cell: (context) => (
            <OrderQuoteValueCell
              quoteSize={context.getValue()}
              quoteSymbol={context.row.original.quoteSymbol}
              isCloseEntirePosition={false}
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
      emptyState={<EmptyTablePlaceholder type="history_trades" />}
    />
  );
}
