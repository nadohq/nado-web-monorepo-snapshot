'use client';

import {
  signDependentValue,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { MarketProductInfoCell } from 'client/components/DataTable/cells/MarketProductInfoCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { CurrencyCell } from 'client/modules/tables/cells/CurrencyCell';
import { TitleHeaderCell } from 'client/modules/tables/cells/TitleHeaderCell';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { CalculatorIconHeaderCell } from 'client/pages/Portfolio/subpages/MarginManager/tables/cells/CalculatorIconHeaderCell';
import { MarginManagerActionsCell } from 'client/pages/Portfolio/subpages/MarginManager/tables/cells/MarginManagerActionsCell';
import { MarginWeightCell } from 'client/pages/Portfolio/subpages/MarginManager/tables/cells/MarginWeightCell';
import { MarginWeightHeaderCell } from 'client/pages/Portfolio/subpages/MarginManager/tables/cells/MarginWeightHeaderCell';
import { MarginManagerDropdownAction } from 'client/pages/Portfolio/subpages/MarginManager/tables/components/MarginManagerTableActionsDropdown';
import {
  MarginManagerQuoteBalanceTableItem,
  useMarginManagerQuoteBalanceTable,
} from 'client/pages/Portfolio/subpages/MarginManager/tables/hooks/useMarginManagerQuoteBalanceTable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<MarginManagerQuoteBalanceTableItem>();

export function MarginManagerQuoteBalanceTable({ className }: WithClassnames) {
  const { t } = useTranslation();

  const { primaryQuoteToken } = useNadoMetadataContext();
  const { balances, isLoading } = useMarginManagerQuoteBalanceTable();

  const columns: ColumnDef<MarginManagerQuoteBalanceTableItem, any>[] =
    useMemo(() => {
      return [
        columnHelper.accessor('metadata', {
          header: ({ header }) => (
            <TitleHeaderCell header={header}>
              {t(($) => $.symbolBalance, {
                symbol: primaryQuoteToken.symbol,
              })}
            </TitleHeaderCell>
          ),
          cell: ({ getValue }) => {
            const metadata =
              getValue<MarginManagerQuoteBalanceTableItem['metadata']>();
            return (
              <MarketProductInfoCell
                symbol={metadata.token.symbol}
                iconSrc={metadata.token.icon.asset}
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
              definitionTooltipId="marginManagerSpotQuoteBalance"
              header={header}
            >
              {t(($) => $.balance)}
            </HeaderCell>
          ),
          cell: ({ getValue }) => {
            return <CurrencyCell value={getValue()} />;
          },
          enableSorting: false,
          meta: {
            cellContainerClassName: 'min-w-30 max-w-36',
          },
        }),
        columnHelper.accessor('unsettledQuoteUsd', {
          header: ({ header }) => (
            <HeaderCell
              definitionTooltipId="marginManagerUnsettledQuoteBalance"
              header={header}
            >
              {t(($) => $.unsettledPnl)}
            </HeaderCell>
          ),
          cell: ({ getValue }) => {
            return <CurrencyCell value={getValue()} />;
          },
          enableSorting: false,
          meta: {
            cellContainerClassName: 'min-w-32 max-w-36',
          },
        }),
        columnHelper.accessor('netBalanceUsd', {
          header: ({ header }) => (
            <HeaderCell
              definitionTooltipId="marginManagerQuoteNetBalance"
              header={header}
            >
              {t(($) => $.netBalance)}
            </HeaderCell>
          ),
          cell: ({ getValue }) => {
            return <CurrencyCell value={getValue()} />;
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
          enableSorting: false,
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
          enableSorting: false,
          meta: {
            cellContainerClassName: 'min-w-44 max-w-48',
          },
        }),
        columnHelper.display({
          id: 'actions',
          header: ({ header }) => (
            <CalculatorIconHeaderCell
              definitionTooltipId="marginManagerQuoteMarginCalc"
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
    }, [primaryQuoteToken.symbol, t]);

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
      emptyState={<EmptyTablePlaceholder type="margin_manager_quote_balance" />}
    />
  );
}
