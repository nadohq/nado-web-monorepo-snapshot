import { CustomNumberFormatSpecifier } from '@nadohq/react-client';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { MarketProductInfoCell } from 'client/components/DataTable/cells/MarketProductInfoCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { bigNumberSortFn } from 'client/components/DataTable/utils/sortingFns';
import { PnlValueWithPercentage } from 'client/components/PnlValueWithPercentage';
import { useNlpBalancesTable } from 'client/modules/nlp/hooks/useNlpBalancesTable';
import { NlpBalancesTableItem } from 'client/modules/nlp/types/NlpBalancesTableItem';
import { AmountWithSymbolCell } from 'client/modules/tables/cells/AmountWithSymbolCell';
import { CurrencyCell } from 'client/modules/tables/cells/CurrencyCell';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<NlpBalancesTableItem>();

export function NlpBalancesTable() {
  const { t } = useTranslation();

  const { balances, isLoading } = useNlpBalancesTable();

  const columns: ColumnDef<NlpBalancesTableItem, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('metadata', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.asset)}</HeaderCell>
        ),
        cell: ({ getValue }) => {
          const metadata = getValue<NlpBalancesTableItem['metadata']>();
          return (
            <MarketProductInfoCell
              symbol={metadata.symbol}
              iconSrc={metadata.icon.asset}
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.product,
        },
      }),
      columnHelper.accessor('amount', {
        header: ({ header }) => (
          <HeaderCell definitionTooltipId="assetBalance" header={header}>
            {t(($) => $.balance)}
          </HeaderCell>
        ),
        cell: (context) => {
          const amount = context.getValue<NlpBalancesTableItem['amount']>();
          const symbol = context.row.original.metadata.symbol;

          return (
            <AmountWithSymbolCell
              amount={amount}
              symbol={symbol}
              formatSpecifier={CustomNumberFormatSpecifier.NUMBER_AUTO}
            />
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName:
            TABLE_CELL_CONTAINER_CLASSNAME.amountWithSymbol,
        },
      }),
      columnHelper.accessor('valueUsd', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.value)}</HeaderCell>
        ),
        cell: (context) => {
          return <CurrencyCell value={context.getValue()} />;
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.accessor('estimatedPnlUsd', {
        header: ({ header }) => (
          <HeaderCell header={header}>
            {t(($) => $.estimatedAbbrevPnlRoeParens)}
          </HeaderCell>
        ),
        cell: (context) => {
          const pnlUsd =
            context.getValue<NlpBalancesTableItem['estimatedPnlUsd']>();
          const pnlFrac = context.row.original.estimatedPnlFrac;

          return (
            <TableCell>
              {pnlUsd && (
                <PnlValueWithPercentage
                  className="flex flex-col gap-y-1.5"
                  pnlUsd={pnlUsd}
                  pnlFrac={pnlFrac}
                />
              )}
            </TableCell>
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
    ];
  }, [t]);

  return (
    <DataTable
      pagination={undefined}
      columns={columns}
      data={balances}
      isLoading={isLoading}
      largeScreenColumnPinning={{
        left: ['metadata'],
      }}
      emptyState={<EmptyTablePlaceholder type="nlp_balances" />}
    />
  );
}
