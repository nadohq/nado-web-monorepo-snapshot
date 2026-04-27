import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { Icons, SecondaryButton } from '@nadohq/web-ui';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { ColumnsSettingsButton } from 'client/components/DataTable/components/ColumnsSettingsButton';
import { DataTable } from 'client/components/DataTable/DataTable';
import {
  bigNumberSortFn,
  getCustomGetterPrimitiveSortFn,
  getKeyedBigNumberSortFn,
} from 'client/components/DataTable/utils/sortingFns';
import { PnlValueWithPercentage } from 'client/components/PnlValueWithPercentage';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { AmountWithSymbolCell } from 'client/modules/tables/cells/AmountWithSymbolCell';
import { CurrencyCell } from 'client/modules/tables/cells/CurrencyCell';
import { NumberCell } from 'client/modules/tables/cells/NumberCell';
import { PerpMarginCell } from 'client/modules/tables/cells/PerpMarginCell';
import { PerpTpSlCell } from 'client/modules/tables/cells/PerpTpSlCell/PerpTpSlCell';
import { CloseAllPositionsDropdown } from 'client/modules/tables/components/CloseAllPositionsDropdown';
import { PerpPnlShareButton } from 'client/modules/tables/components/PerpPnlShareButton';
import { PerpPositionLabel } from 'client/modules/tables/components/PerpPositionLabel';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { PerpPositionsColumnId } from 'client/modules/tables/customizableTables/tableConfigs/perpPositions';
import { useTableColumnSettings } from 'client/modules/tables/customizableTables/useTableColumnSettings';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { usePerpPositionsTable } from 'client/modules/tables/perpPositions/usePerpPositionsTable';
import { PerpPositionsTableItem } from 'client/modules/tables/types/PerpPositionsTableItem';
import { useHandleMarketClosePosition } from 'client/modules/trading/closePosition/hooks/useHandleMarketClosePosition';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<PerpPositionsTableItem>();

interface Props {
  productIds?: number[];
}

export function PerpPositionsTable({
  className,
  productIds,
}: WithClassnames<Props>) {
  const { t } = useTranslation();

  const { show } = useDialog();
  const handleMarketClosePosition = useHandleMarketClosePosition();
  const { columnOrder, columnVisibility, columnLabels } =
    useTableColumnSettings('perpPositions');

  const { positions, isLoading } = usePerpPositionsTable({
    productIds,
  });

  const isConnected = useIsConnected();
  const disableActions = !isConnected;

  const columns: ColumnDef<PerpPositionsTableItem, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('productName' satisfies PerpPositionsColumnId, {
        header: ({ header }) => (
          <HeaderCell header={header}>{columnLabels.productName}</HeaderCell>
        ),
        cell: (context) => (
          <TableCell>
            <PerpPositionLabel
              productId={context.row.original.productId}
              marketName={context.row.original.productName}
              amountForSide={context.row.original.positionAmount}
              marginModeType={context.row.original.margin.marginModeType}
              isoLeverage={context.row.original.margin.isoLeverage}
            />
          </TableCell>
        ),
        sortingFn: getCustomGetterPrimitiveSortFn(
          (row) => row.original.productName,
        ),
        meta: {
          cellContainerClassName:
            TABLE_CELL_CONTAINER_CLASSNAME.productWithHighlight,
        },
      }),
      columnHelper.accessor('positionSize' satisfies PerpPositionsColumnId, {
        header: ({ header }) => (
          <HeaderCell header={header}>{columnLabels.positionSize}</HeaderCell>
        ),
        cell: (context) => {
          return (
            <AmountWithSymbolCell
              symbol={context.row.original.baseSymbol}
              amount={context.getValue()}
              formatSpecifier={context.row.original.formatSpecifier.size}
              dataTestId="perp-positions-table-size"
            />
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName:
            TABLE_CELL_CONTAINER_CLASSNAME.amountWithSymbol,
        },
      }),
      columnHelper.accessor('notionalValueUsd', {
        id: 'notionalValueUsd' satisfies PerpPositionsColumnId,
        header: ({ header }) => (
          <HeaderCell header={header}>
            {columnLabels.notionalValueUsd}
          </HeaderCell>
        ),
        cell: (context) => {
          return (
            <CurrencyCell
              value={context.getValue()}
              dataTestId="perp-positions-table-value"
            />
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.price,
        },
      }),
      columnHelper.accessor(
        'averageEntryPrice' satisfies PerpPositionsColumnId,
        {
          header: ({ header }) => (
            <HeaderCell definitionTooltipId="averageEntryPrice" header={header}>
              {columnLabels.averageEntryPrice}
            </HeaderCell>
          ),
          cell: (context) => {
            return (
              <NumberCell
                value={context.getValue()}
                formatSpecifier={context.row.original.formatSpecifier.price}
                dataTestId="perp-positions-table-entry-price"
              />
            );
          },
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.price,
          },
        },
      ),
      columnHelper.accessor('oraclePrice' satisfies PerpPositionsColumnId, {
        header: ({ header }) => (
          <HeaderCell definitionTooltipId="oraclePrice" header={header}>
            {columnLabels.oraclePrice}
          </HeaderCell>
        ),
        cell: (context) => {
          return (
            <NumberCell
              value={context.getValue()}
              dataTestId="perp-positions-table-oracle-price"
              formatSpecifier={context.row.original.formatSpecifier.price}
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.price,
        },
      }),
      columnHelper.accessor(
        'estimatedLiquidationPrice' satisfies PerpPositionsColumnId,
        {
          header: ({ header }) => (
            <HeaderCell
              header={header}
              definitionTooltipId="perpPositionsEstimatedLiqPrice"
            >
              {columnLabels.estimatedLiquidationPrice}
            </HeaderCell>
          ),
          cell: (context) => {
            return (
              <NumberCell
                formatSpecifier={context.row.original.formatSpecifier.price}
                value={context.getValue()}
                dataTestId="perp-positions-table-estimated-liquidation-price"
              />
            );
          },
          enableSorting: false,
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.price,
          },
        },
      ),
      columnHelper.accessor('tpSl' satisfies PerpPositionsColumnId, {
        header: ({ header }) => (
          <HeaderCell definitionTooltipId="perpPositionsTpSl" header={header}>
            {columnLabels.tpSl}
          </HeaderCell>
        ),
        cell: (context) => {
          return (
            <PerpTpSlCell
              productId={context.row.original.productId}
              isIso={!!context.row.original.isoSubaccountName}
              tpSlData={context.getValue()}
              priceFormatSpecifier={context.row.original.formatSpecifier.price}
              averageEntryPrice={context.row.original.averageEntryPrice}
              positionAmount={context.row.original.positionAmount}
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: 'min-w-32 max-w-38',
        },
      }),
      columnHelper.accessor('pnlInfo' satisfies PerpPositionsColumnId, {
        header: ({ header }) => (
          <HeaderCell
            definitionTooltipId="estimatedPositionPnL"
            header={header}
          >
            {columnLabels.pnlInfo}
          </HeaderCell>
        ),
        cell: (context) => {
          const { productId, estimatedExitPrice, averageEntryPrice, pnlInfo } =
            context.row.original;

          const { estimatedPnlUsd, estimatedPnlFrac } = pnlInfo;

          return (
            <TableCell className="flex items-center gap-x-2">
              <PnlValueWithPercentage
                dataTestId="perp-positions-table-estimated-pnl"
                className="flex flex-col gap-y-1.5"
                pnlUsd={estimatedPnlUsd}
                pnlFrac={estimatedPnlFrac}
              />
              <PerpPnlShareButton
                productId={productId}
                positionAmount={context.row.original.positionAmount}
                pnlFrac={estimatedPnlFrac}
                pnlUsd={estimatedPnlUsd}
                entryPrice={averageEntryPrice}
                referencePrice={estimatedExitPrice}
                referencePriceLabel={t(($) => $.currentPrice)}
                marginModeType={context.row.original.margin.marginModeType}
                isoLeverage={context.row.original.margin.isoLeverage}
                dataTestId="perp-positions-table-estimated-pnl-share-button"
              />
            </TableCell>
          );
        },
        sortingFn: getKeyedBigNumberSortFn('estimatedPnlUsd'),
        meta: {
          cellContainerClassName: 'min-w-34 max-w-40',
        },
      }),
      columnHelper.accessor('margin' satisfies PerpPositionsColumnId, {
        header: ({ header }) => (
          <HeaderCell header={header} definitionTooltipId="perpPositionsMargin">
            {columnLabels.margin}
          </HeaderCell>
        ),
        cell: (context) => {
          const { margin, isoSubaccountName } = context.row.original;

          return (
            <PerpMarginCell
              margin={margin}
              isoSubaccountName={isoSubaccountName}
              dataTestId="perp-positions-table-margin"
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.accessor('netFunding' satisfies PerpPositionsColumnId, {
        header: ({ header }) => (
          <HeaderCell
            definitionTooltipId="perpPositionsFundingPayments"
            header={header}
          >
            {columnLabels.netFunding}
          </HeaderCell>
        ),
        cell: (context) => {
          const netFunding =
            context.getValue<PerpPositionsTableItem['netFunding']>();
          const netFundingColor = getSignDependentColorClassName(netFunding);

          return (
            <CurrencyCell
              dataTestId="perp-positions-table-funding"
              className={netFundingColor}
              value={netFunding}
              formatSpecifier={PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP}
            />
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.display({
        id: 'actions' satisfies PerpPositionsColumnId,
        header: ({ header }) => (
          <HeaderCell header={header}>
            <div className="flex items-center gap-x-2">
              <ColumnsSettingsButton tableType="perpPositions" />
              <CloseAllPositionsDropdown
                closePositionsFilter={{ productIds }}
              />
            </div>
          </HeaderCell>
        ),
        cell: (context) => {
          const { productId, isoSubaccountName } = context.row.original;

          return (
            <TableCell className="items-stretch gap-x-1.5">
              <SecondaryButton
                size="xs"
                title={t(($) => $.buttons.reversePosition)}
                onClick={() => {
                  show({
                    type: 'reverse_position',
                    params: {
                      productId,
                      isIso: !!isoSubaccountName,
                    },
                  });
                }}
                disabled={disableActions}
                dataTestId="perp-positions-table-reverse-position-button"
              >
                <Icons.ArrowsDownUp />
              </SecondaryButton>
              <SecondaryButton
                size="xs"
                title={t(($) => $.buttons.limitClosePosition)}
                onClick={() => {
                  show({
                    type: 'close_position',
                    params: {
                      productId,
                      isoSubaccountName,
                      isLimitOrder: true,
                    },
                  });
                }}
                disabled={disableActions}
                dataTestId="perp-positions-table-limit-close-position-button"
              >
                {t(($) => $.buttons.limit)}
              </SecondaryButton>
              <SecondaryButton
                size="xs"
                title={t(($) => $.buttons.marketClosePosition)}
                onClick={() => {
                  handleMarketClosePosition({
                    productId,
                    isoSubaccountName,
                  });
                }}
                disabled={disableActions}
                dataTestId="perp-positions-table-market-close-position-button"
              >
                {t(($) => $.buttons.market)}
              </SecondaryButton>
            </TableCell>
          );
        },
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.actions,
        },
      }),
    ];
  }, [
    columnLabels,
    disableActions,
    productIds,
    show,
    handleMarketClosePosition,
    t,
  ]);

  return (
    <DataTable
      columns={columns}
      data={positions}
      isLoading={isLoading}
      pagination={undefined}
      columnOrder={columnOrder}
      columnVisibility={columnVisibility}
      emptyState={<EmptyTablePlaceholder type="perp_positions" />}
      largeScreenColumnPinning={{
        left: ['productName'],
        right: ['actions'],
      }}
      tableContainerClassName={className}
    />
  );
}
