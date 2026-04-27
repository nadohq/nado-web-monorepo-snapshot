import { QUOTE_PRODUCT_ID } from '@nadohq/client';
import { CustomNumberFormatSpecifier } from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import {
  bigNumberSortFn,
  getCustomGetterPrimitiveSortFn,
  getKeyedBigNumberSortFn,
} from 'client/components/DataTable/utils/sortingFns';
import { PnlValueWithPercentage } from 'client/components/PnlValueWithPercentage';
import { ProductLabel } from 'client/components/ProductLabel';
import { ProductLabelLink } from 'client/components/ProductLabelLink';
import { AmountWithSymbolCell } from 'client/modules/tables/cells/AmountWithSymbolCell';
import { CurrencyCell } from 'client/modules/tables/cells/CurrencyCell';
import { PercentageCell } from 'client/modules/tables/cells/PercentageCell';
import { SpotActionButtonCell } from 'client/modules/tables/cells/SpotActionButtonCell';
import { QuoteAmount } from 'client/modules/tables/components/QuoteAmount';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import {
  SpotBalanceTableItem,
  useSpotBalancesTable,
} from 'client/modules/tables/spotBalances/useSpotBalancesTable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<SpotBalanceTableItem>();

interface Props {
  hideSmallBalances?: boolean;
}

export function SpotBalancesTable({
  hideSmallBalances,
  className,
}: WithClassnames<Props>) {
  const { t } = useTranslation();

  const { balances, isLoading } = useSpotBalancesTable({ hideSmallBalances });

  const columns: ColumnDef<SpotBalanceTableItem, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('metadata', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.asset)}</HeaderCell>
        ),
        cell: (context) => {
          const metadata = context.getValue<SpotBalanceTableItem['metadata']>();
          const productId = context.row.original.productId;
          return (
            <TableCell>
              <ProductLabelLink productId={productId}>
                <ProductLabel
                  dataTestId="spot-balances-table-product-label"
                  iconSrc={metadata.token.icon.asset}
                  symbol={metadata.token.symbol}
                />
              </ProductLabelLink>
            </TableCell>
          );
        },
        sortingFn: getCustomGetterPrimitiveSortFn(
          (row) => row.original.metadata.token.symbol,
        ),
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.product,
        },
      }),
      columnHelper.accessor('balanceInfo', {
        header: ({ header }) => (
          <HeaderCell definitionTooltipId="assetBalance" header={header}>
            {t(($) => $.balance)}
          </HeaderCell>
        ),
        cell: (context) => {
          const { amount, symbol } =
            context.getValue<SpotBalanceTableItem['balanceInfo']>();
          return (
            <AmountWithSymbolCell
              dataTestId="spot-balances-table-amount"
              symbol={symbol}
              amount={amount}
              formatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
            />
          );
        },
        sortingFn: getKeyedBigNumberSortFn('amount'),
        meta: {
          cellContainerClassName:
            TABLE_CELL_CONTAINER_CLASSNAME.amountWithSymbol,
        },
      }),
      columnHelper.accessor('balanceInfo.valueUsd', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.value)}</HeaderCell>
        ),
        cell: (context) => {
          return (
            <CurrencyCell
              dataTestId="spot-balances-table-value"
              value={context.getValue()}
            />
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.accessor('depositAPY', {
        header: ({ header }) => (
          <HeaderCell definitionTooltipId="depositAPY" header={header}>
            {t(($) => $.depositApy)}
          </HeaderCell>
        ),
        cell: (context) => (
          <PercentageCell
            dataTestId="spot-balances-table-deposit-apy"
            fraction={context.getValue()}
          />
        ),
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.percentage,
        },
      }),
      columnHelper.accessor('borrowAPY', {
        header: ({ header }) => (
          <HeaderCell definitionTooltipId="borrowAPY" header={header}>
            {t(($) => $.borrowApy)}
          </HeaderCell>
        ),
        cell: (context) => (
          <PercentageCell
            dataTestId="spot-balances-table-borrow-apy"
            fraction={context.getValue()}
          />
        ),
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.percentage,
        },
      }),
      columnHelper.accessor('estimatedPnlUsd', {
        header: ({ header }) => (
          <HeaderCell
            header={header}
            definitionTooltipId="estimatedPositionPnL"
          >
            {t(($) => $.estimatedAbbrevPnlRoeParens)}
          </HeaderCell>
        ),
        cell: (context) => {
          const pnlUsd = context.getValue();
          const pnlFrac = context.row.original.estimatedPnlFrac;
          return (
            <TableCell>
              {pnlUsd && (
                <PnlValueWithPercentage
                  dataTestId="spot-balances-table-estimated-pnl"
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
      columnHelper.accessor('netInterestUnrealized', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.interest)}</HeaderCell>
        ),
        cell: (context) => {
          const isPrimaryQuote =
            context.row.original.productId === QUOTE_PRODUCT_ID;
          const netInterest = context.getValue();
          return (
            <TableCell>
              <QuoteAmount
                dataTestId="spot-balances-table-net-interest"
                quoteAmount={netInterest}
                quoteSymbol={context.row.original.metadata.token.symbol}
                isPrimaryQuote={isPrimaryQuote}
                signDependentColor
              />
            </TableCell>
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => null,
        cell: (context) => (
          <SpotActionButtonCell
            symbol={context.row.original.metadata.token.symbol}
            productId={context.row.original.productId}
            balanceAmount={context.row.original.amount}
          />
        ),
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.actions,
        },
        enableSorting: false,
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
        right: ['actions'],
      }}
      emptyState={<EmptyTablePlaceholder type="spot_balances" />}
    />
  );
}
