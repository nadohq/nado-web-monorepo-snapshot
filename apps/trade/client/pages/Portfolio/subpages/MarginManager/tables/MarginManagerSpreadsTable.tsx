'use client';

import { WithClassnames } from '@nadohq/web-common';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { MarketProductInfoCell } from 'client/components/DataTable/cells/MarketProductInfoCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import {
  bigNumberSortFn,
  getKeyedBigNumberSortFn,
} from 'client/components/DataTable/utils/sortingFns';
import { AmountWithSymbolCell } from 'client/modules/tables/cells/AmountWithSymbolCell';
import { TitleHeaderCell } from 'client/modules/tables/cells/TitleHeaderCell';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { CalculatorIconHeaderCell } from 'client/pages/Portfolio/subpages/MarginManager/tables/cells/CalculatorIconHeaderCell';
import { MarginManagerActionsCell } from 'client/pages/Portfolio/subpages/MarginManager/tables/cells/MarginManagerActionsCell';
import { MarginWeightCell } from 'client/pages/Portfolio/subpages/MarginManager/tables/cells/MarginWeightCell';
import { MarginWeightHeaderCell } from 'client/pages/Portfolio/subpages/MarginManager/tables/cells/MarginWeightHeaderCell';
import {
  MarginManagerSpreadTableItem,
  useMarginManagerSpreadsTable,
} from 'client/pages/Portfolio/subpages/MarginManager/tables/hooks/useMarginManagerSpreadsTable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<MarginManagerSpreadTableItem>();

export function MarginManagerSpreadsTable({ className }: WithClassnames) {
  const { t } = useTranslation();

  const { data: spreads, isLoading } = useMarginManagerSpreadsTable();

  const columns: ColumnDef<MarginManagerSpreadTableItem, any>[] =
    useMemo(() => {
      const benefitLabel = t(($) => $.spreadsTable.benefit);

      return [
        columnHelper.accessor('metadata', {
          header: ({ header }) => (
            <TitleHeaderCell header={header}>
              {t(($) => $.spreads)}
            </TitleHeaderCell>
          ),
          cell: ({ getValue }) => {
            const spotMetadata =
              getValue<MarginManagerSpreadTableItem['metadata']>();
            return (
              <MarketProductInfoCell
                symbol={spotMetadata.symbol}
                iconSrc={spotMetadata.icon.asset}
              />
            );
          },
          enableSorting: false,
          meta: {
            cellContainerClassName: 'w-42',
          },
        }),
        columnHelper.accessor('spreadSize', {
          header: ({ header }) => (
            <HeaderCell
              definitionTooltipId="marginManagerSizeOfSpread"
              header={header}
            >
              {t(($) => $.spreadsTable.sizeOfSpread)}
            </HeaderCell>
          ),
          cell: (context) => {
            const { symbol } = context.row.original.metadata;

            return (
              <AmountWithSymbolCell
                formatSpecifier={context.row.original.sizeFormatSpecifier}
                amount={context.getValue()}
                symbol={symbol}
              />
            );
          },
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName: 'min-w-30 max-w-36',
          },
        }),
        columnHelper.accessor('spotSpreadAmount', {
          header: ({ header }) => (
            <HeaderCell
              definitionTooltipId="marginManagerSpotPortionOfSpread"
              header={header}
            >
              {t(($) => $.spreadsTable.spotPortion)}
            </HeaderCell>
          ),
          cell: (context) => {
            const { symbol } = context.row.original.metadata;

            return (
              <AmountWithSymbolCell
                amount={context.getValue()}
                symbol={symbol}
                formatSpecifier={context.row.original.sizeFormatSpecifier}
              />
            );
          },
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName: 'min-w-30 max-w-36',
          },
        }),
        columnHelper.accessor('perpSpreadAmount', {
          header: ({ header }) => (
            <HeaderCell
              definitionTooltipId="marginManagerPerpPortionOfSpread"
              header={header}
            >
              {t(($) => $.spreadsTable.perpPortion)}
            </HeaderCell>
          ),
          cell: (context) => {
            const { symbol } = context.row.original.metadata;

            return (
              <AmountWithSymbolCell
                amount={context.getValue()}
                symbol={symbol}
                formatSpecifier={context.row.original.sizeFormatSpecifier}
              />
            );
          },
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName: 'min-w-28',
          },
        }),
        columnHelper.accessor('initialHealthBenefit', {
          header: ({ header }) => (
            <MarginWeightHeaderCell
              isInitial
              header={header}
              marginLabel={benefitLabel}
            />
          ),
          cell: ({ getValue }) => {
            return <MarginWeightCell marginWeightMetrics={getValue()} />;
          },
          sortingFn: getKeyedBigNumberSortFn('marginUsd'),
          meta: {
            cellContainerClassName: 'min-w-44 max-w-48',
          },
        }),
        columnHelper.accessor('maintenanceHealthBenefit', {
          header: ({ header }) => (
            <MarginWeightHeaderCell
              isInitial={false}
              header={header}
              marginLabel={benefitLabel}
            />
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
              definitionTooltipId="marginManagerSpreadMarginCalc"
              header={header}
            />
          ),
          cell: (context) => {
            const { spotProductId, perpProductId } = context.row.original;

            return (
              <MarginManagerActionsCell
                actions={[
                  {
                    type: 'trade_spot',
                    label: t(($) => $.buttons.tradeSpot),
                    productId: spotProductId,
                  },
                  {
                    type: 'trade_perp',
                    label: t(($) => $.buttons.tradePerp),
                    productId: perpProductId,
                  },
                ]}
              />
            );
          },
          meta: {
            cellContainerClassName: 'w-32',
          },
        }),
      ];
    }, [t]);

  return (
    <DataTable
      columns={columns}
      data={spreads}
      isLoading={isLoading}
      pagination={undefined}
      tableContainerClassName={className}
      largeScreenColumnPinning={{
        left: ['metadata'],
      }}
      emptyState={<EmptyTablePlaceholder type="spreads" />}
    />
  );
}
