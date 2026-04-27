import { CustomNumberFormatSpecifier } from '@nadohq/react-client';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { MarketProductInfoCell } from 'client/components/DataTable/cells/MarketProductInfoCell';
import { bigNumberSortFn } from 'client/components/DataTable/utils/sortingFns';
import { ActionName } from 'client/modules/commandCenter/components/cells/ActionName';
import { BaseTable } from 'client/modules/commandCenter/components/tables/BaseTable/BaseTable';
import { BalanceTableItem } from 'client/modules/commandCenter/hooks/useCommandCenterBalanceItems';
import { NumberCell } from 'client/modules/tables/cells/NumberCell';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<BalanceTableItem>();

interface Props {
  balances: BalanceTableItem[] | undefined;
}

export function BalancesTable({ balances }: Props) {
  const { t } = useTranslation();

  const columns: ColumnDef<BalanceTableItem, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('metadata', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.asset)}</HeaderCell>
        ),
        cell: ({ getValue }) => {
          const metadata = getValue<BalanceTableItem['metadata']>();
          return (
            <MarketProductInfoCell
              symbol={metadata.token.symbol}
              iconSrc={metadata.token.icon.asset}
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName:
            TABLE_CELL_CONTAINER_CLASSNAME.productWithHighlight,
        },
      }),
      columnHelper.accessor('amount', {
        header: ({ header }) => (
          <HeaderCell definitionTooltipId="assetBalance" header={header}>
            {t(($) => $.balance)}
          </HeaderCell>
        ),
        cell: (context) => (
          <NumberCell
            value={context.getValue()}
            formatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
          />
        ),
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.accessor('walletAmount', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.inWallet)}</HeaderCell>
        ),
        cell: (context) => {
          return (
            <NumberCell
              value={context.getValue()}
              formatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
            />
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: 'hidden lg:flex min-w-28',
        },
      }),
      columnHelper.display({
        id: 'action',
        header: () => null,
        cell: (context) => (
          <ActionName>{context.row.original.actionText}</ActionName>
        ),
        meta: {
          cellContainerClassName: 'ml-auto',
        },
        enableSorting: false,
      }),
    ];
  }, [t]);

  return (
    <BaseTable
      id="balances"
      columns={columns}
      data={balances}
      onSelect={(row) => row.original.action()}
    />
  );
}
