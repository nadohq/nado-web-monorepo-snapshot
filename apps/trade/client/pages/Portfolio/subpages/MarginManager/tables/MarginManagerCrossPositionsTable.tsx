'use client';

import {
  getMarketSizeFormatSpecifier,
  PresetNumberFormatSpecifier,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { SecondaryButton } from '@nadohq/web-ui';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import {
  bigNumberSortFn,
  getKeyedBigNumberSortFn,
} from 'client/components/DataTable/utils/sortingFns';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { AmountWithSymbolCell } from 'client/modules/tables/cells/AmountWithSymbolCell';
import { CurrencyCell } from 'client/modules/tables/cells/CurrencyCell';
import { PnlCell } from 'client/modules/tables/cells/PnlCell';
import { TitleHeaderCell } from 'client/modules/tables/cells/TitleHeaderCell';
import { PerpPositionLabel } from 'client/modules/tables/components/PerpPositionLabel';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { useHandleMarketClosePosition } from 'client/modules/trading/closePosition/hooks/useHandleMarketClosePosition';
import { CalculatorIconHeaderCell } from 'client/pages/Portfolio/subpages/MarginManager/tables/cells/CalculatorIconHeaderCell';
import { MarginWeightCell } from 'client/pages/Portfolio/subpages/MarginManager/tables/cells/MarginWeightCell';
import { MarginWeightHeaderCell } from 'client/pages/Portfolio/subpages/MarginManager/tables/cells/MarginWeightHeaderCell';
import {
  MarginManagerCrossPositionsTableItem,
  useMarginManagerPerpPositionsTable,
} from 'client/pages/Portfolio/subpages/MarginManager/tables/hooks/useMarginManagerPerpPositionsTable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<MarginManagerCrossPositionsTableItem>();

export function MarginManagerCrossPositionsTable({
  className,
}: WithClassnames) {
  const { t } = useTranslation();

  const { show } = useDialog();
  const handleMarketClosePosition = useHandleMarketClosePosition();
  const { primaryQuoteToken } = useNadoMetadataContext();
  const {
    positions: { crossMargin },
    isLoading,
  } = useMarginManagerPerpPositionsTable();

  const isConnected = useIsConnected();

  const columns: ColumnDef<MarginManagerCrossPositionsTableItem, any>[] =
    useMemo(() => {
      return [
        columnHelper.accessor('marketInfo', {
          header: ({ header }) => (
            <TitleHeaderCell header={header}>
              {t(($) => $.perps)}
            </TitleHeaderCell>
          ),
          cell: (context) => (
            <TableCell>
              <PerpPositionLabel
                productId={context.row.original.productId}
                marketName={context.getValue().marketName}
                amountForSide={context.row.original.positionAmount}
                marginModeType="cross"
              />
            </TableCell>
          ),
          enableSorting: false,
          meta: {
            cellContainerClassName: 'w-42 product-label-border-container',
          },
        }),
        columnHelper.accessor('positionAmount', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.position)}</HeaderCell>
          ),
          cell: (context) => {
            const { sizeIncrement, symbol } = context.row.original.marketInfo;

            return (
              <AmountWithSymbolCell
                amount={context.getValue()}
                formatSpecifier={getMarketSizeFormatSpecifier({
                  sizeIncrement,
                })}
                symbol={symbol}
              />
            );
          },
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName: 'min-w-30 max-w-36',
          },
        }),
        columnHelper.accessor('notionalValueUsd', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.notional)}</HeaderCell>
          ),
          cell: (context) => {
            return (
              <CurrencyCell
                value={context.getValue()}
                formatSpecifier={PresetNumberFormatSpecifier.CURRENCY_2DP}
              />
            );
          },
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName: 'min-w-30 max-w-36',
          },
        }),
        columnHelper.accessor('estimatedPnlUsd', {
          header: ({ header }) => (
            <HeaderCell
              definitionTooltipId="estimatedPositionPnL"
              header={header}
            >
              {t(($) => $.estimatedAbbrevPnl)}
            </HeaderCell>
          ),
          cell: (context) => {
            return <PnlCell value={context.getValue()} />;
          },
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName: 'min-w-30 max-w-36',
          },
        }),
        columnHelper.accessor('unsettledQuoteAmount', {
          header: ({ header }) => (
            <HeaderCell
              header={header}
              definitionTooltipId="marginManagerPerpPositionsUnsettled"
            >
              {t(($) => $.unsettled)}
            </HeaderCell>
          ),
          cell: ({ getValue }) => {
            return (
              <AmountWithSymbolCell
                amount={getValue()}
                formatSpecifier={PresetNumberFormatSpecifier.SIGNED_NUMBER_2DP}
                symbol={primaryQuoteToken.symbol}
              />
            );
          },
          enableSorting: false,
          meta: {
            cellContainerClassName: 'min-w-32',
          },
        }),
        columnHelper.accessor('initialHealth', {
          header: ({ header }) => (
            <MarginWeightHeaderCell isInitial header={header} />
          ),
          cell: ({ getValue }) => {
            return <MarginWeightCell marginWeightMetrics={getValue()} />;
          },
          sortingFn: getKeyedBigNumberSortFn('marginUsd'),
          meta: {
            cellContainerClassName: 'min-w-44 max-w-48',
          },
        }),
        columnHelper.accessor('maintenanceHealth', {
          header: ({ header }) => (
            <MarginWeightHeaderCell isInitial={false} header={header} />
          ),
          cell: ({ getValue }) => {
            return <MarginWeightCell marginWeightMetrics={getValue()} />;
          },
          sortingFn: getKeyedBigNumberSortFn('marginUsd'),
          meta: {
            cellContainerClassName: 'min-w-44 max-w-48',
          },
        }),
        columnHelper.display({
          id: 'actions',
          header: ({ header }) => (
            <CalculatorIconHeaderCell
              definitionTooltipId="marginManagerPerpCrossMarginCalc"
              header={header}
            />
          ),
          cell: (context) => {
            const { productId } = context.row.original;
            return (
              <TableCell className="items-center justify-end gap-x-1.5">
                <SecondaryButton
                  size="xs"
                  title={t(($) => $.buttons.limitClosePosition)}
                  onClick={() => {
                    show({
                      type: 'close_position',
                      params: {
                        productId,
                        // Margin manager only shows cross positions
                        isoSubaccountName: undefined,
                        isLimitOrder: true,
                      },
                    });
                  }}
                  disabled={!isConnected}
                >
                  {t(($) => $.limit)}
                </SecondaryButton>
                <SecondaryButton
                  size="xs"
                  title={t(($) => $.buttons.marketClosePosition)}
                  onClick={() => {
                    handleMarketClosePosition({
                      productId,
                      // Margin manager only shows cross positions
                      isoSubaccountName: undefined,
                    });
                  }}
                  disabled={!isConnected}
                >
                  {t(($) => $.market)}
                </SecondaryButton>
              </TableCell>
            );
          },
          meta: {
            cellContainerClassName: 'w-32',
          },
        }),
      ];
    }, [
      primaryQuoteToken.symbol,
      isConnected,
      show,
      handleMarketClosePosition,
      t,
    ]);

  return (
    <DataTable
      columns={columns}
      data={crossMargin}
      isLoading={isLoading}
      pagination={undefined}
      tableContainerClassName={className}
      largeScreenColumnPinning={{
        left: ['marketInfo'],
      }}
      emptyState={<EmptyTablePlaceholder type="perp_positions" />}
    />
  );
}
