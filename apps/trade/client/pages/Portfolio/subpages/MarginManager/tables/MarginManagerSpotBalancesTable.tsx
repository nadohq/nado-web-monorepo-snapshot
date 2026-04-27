'use client';

import {
  CustomNumberFormatSpecifier,
  signDependentValue,
} from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import {
  bigNumberSortFn,
  getKeyedBigNumberSortFn,
} from 'client/components/DataTable/utils/sortingFns';
import { AmountWithSymbolCell } from 'client/modules/tables/cells/AmountWithSymbolCell';
import { CurrencyCell } from 'client/modules/tables/cells/CurrencyCell';
import { TitleHeaderCell } from 'client/modules/tables/cells/TitleHeaderCell';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { CalculatorIconHeaderCell } from 'client/pages/Portfolio/subpages/MarginManager/tables/cells/CalculatorIconHeaderCell';
import { MarginManagerActionsCell } from 'client/pages/Portfolio/subpages/MarginManager/tables/cells/MarginManagerActionsCell';
import { MarginWeightCell } from 'client/pages/Portfolio/subpages/MarginManager/tables/cells/MarginWeightCell';
import { MarginWeightHeaderCell } from 'client/pages/Portfolio/subpages/MarginManager/tables/cells/MarginWeightHeaderCell';
import { SpotBalanceInfoCell } from 'client/pages/Portfolio/subpages/MarginManager/tables/cells/SpotBalanceInfoCell';
import { MarginManagerDropdownAction } from 'client/pages/Portfolio/subpages/MarginManager/tables/components/MarginManagerTableActionsDropdown';
import {
  MarginManagerSpotBalanceTableItem,
  useMarginManagerSpotBalancesTable,
} from 'client/pages/Portfolio/subpages/MarginManager/tables/hooks/useMarginManagerSpotBalancesTable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<MarginManagerSpotBalanceTableItem>();

export function MarginManagerSpotBalancesTable({ className }: WithClassnames) {
  const { t } = useTranslation();

  const { balances, isLoading } = useMarginManagerSpotBalancesTable();

  const columns: ColumnDef<MarginManagerSpotBalanceTableItem, any>[] =
    useMemo(() => {
      return [
        columnHelper.accessor('metadata', {
          header: ({ header }) => (
            <TitleHeaderCell header={header}>
              {t(($) => $.balances)}
            </TitleHeaderCell>
          ),
          cell: (context) => {
            const metadata =
              context.getValue<MarginManagerSpotBalanceTableItem['metadata']>();

            return (
              <SpotBalanceInfoCell
                symbol={metadata.token.symbol}
                iconSrc={metadata.token.icon.asset}
                amount={context.row.original.balanceAmount}
              />
            );
          },
          enableSorting: false,
          meta: {
            cellContainerClassName: 'w-42',
          },
        }),
        columnHelper.accessor('balanceAmount', {
          header: ({ header }) => (
            <HeaderCell
              definitionTooltipId="marginManagerSpotAssetBalance"
              header={header}
            >
              {t(($) => $.balance)}
            </HeaderCell>
          ),
          cell: (context) => {
            return (
              <AmountWithSymbolCell
                amount={context.getValue()}
                symbol={context.row.original.metadata.token.symbol}
                formatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
              />
            );
          },
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName: 'min-w-30 max-w-36',
          },
        }),
        columnHelper.accessor('balanceValueUsd', {
          header: ({ header }) => (
            <HeaderCell
              definitionTooltipId="marginManagerSpotBalanceValue"
              header={header}
            >
              {t(($) => $.value)}
            </HeaderCell>
          ),
          cell: ({ getValue }) => {
            return <CurrencyCell value={getValue()} />;
          },
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName: 'min-w-36',
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
              definitionTooltipId="marginManagerBalancesMarginCalc"
              header={header}
            />
          ),
          cell: (context) => {
            const { productId, balanceAmount } = context.row.original;

            const actions: MarginManagerDropdownAction[] = signDependentValue(
              balanceAmount,
              {
                positive: [
                  {
                    type: 'deposit_options',
                    label: t(($) => $.buttons.deposit),
                    productId,
                  },
                  {
                    type: 'withdraw',
                    label: t(($) => $.buttons.withdraw),
                    productId,
                  },
                  {
                    type: 'borrow',
                    label: t(($) => $.buttons.borrow),
                    productId,
                  },
                ],
                negative: [
                  {
                    type: 'repay',
                    label: t(($) => $.buttons.repay),
                    productId,
                  },
                  {
                    type: 'deposit_options',
                    label: t(($) => $.buttons.deposit),
                    productId,
                  },
                  {
                    type: 'borrow',
                    label: t(($) => $.buttons.borrow),
                    productId,
                  },
                ],
                zero: [
                  {
                    type: 'deposit_options',
                    label: t(($) => $.buttons.deposit),
                    productId,
                  },
                  {
                    type: 'borrow',
                    label: t(($) => $.buttons.borrow),
                    productId,
                  },
                ],
              },
            );
            return <MarginManagerActionsCell actions={actions} />;
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
      data={balances}
      isLoading={isLoading}
      pagination={undefined}
      tableContainerClassName={className}
      largeScreenColumnPinning={{
        left: ['metadata'],
      }}
      emptyState={<EmptyTablePlaceholder type="spot_balances" />}
    />
  );
}
