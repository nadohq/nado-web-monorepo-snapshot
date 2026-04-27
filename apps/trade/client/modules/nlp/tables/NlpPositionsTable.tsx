import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { mergeClassNames } from '@nadohq/web-common';
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
import { useNlpPositionsTable } from 'client/modules/nlp/hooks/useNlpPositionsTable';
import { NlpPositionsTableItem } from 'client/modules/nlp/types/NlpPositionsTableItem';
import { AmountWithSymbolCell } from 'client/modules/tables/cells/AmountWithSymbolCell';
import { CurrencyCell } from 'client/modules/tables/cells/CurrencyCell';
import { NumberCell } from 'client/modules/tables/cells/NumberCell';
import { PerpPositionLabel } from 'client/modules/tables/components/PerpPositionLabel';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { PerpPositionsTableItem } from 'client/modules/tables/types/PerpPositionsTableItem';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<NlpPositionsTableItem>();

export function NlpPositionsTable() {
  const { t } = useTranslation();

  const { positions, isLoading } = useNlpPositionsTable();

  const columns: ColumnDef<NlpPositionsTableItem, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('productName', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.market)}</HeaderCell>
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
          cellContainerClassName: mergeClassNames(
            TABLE_CELL_CONTAINER_CLASSNAME.productWithHighlight,
            // Larger width as this has fewer columns
            'w-42',
          ),
        },
      }),
      columnHelper.accessor('positionSize', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.size)}</HeaderCell>
        ),
        cell: (context) => {
          return (
            <AmountWithSymbolCell
              symbol={context.row.original.baseSymbol}
              amount={context.getValue()}
              formatSpecifier={context.row.original.formatSpecifier.size}
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
      columnHelper.accessor('averageEntryPrice', {
        header: ({ header }) => (
          <HeaderCell definitionTooltipId="averageEntryPrice" header={header}>
            {t(($) => $.entryPrice)}
          </HeaderCell>
        ),
        cell: (context) => {
          return (
            <NumberCell
              value={context.getValue()}
              formatSpecifier={context.row.original.formatSpecifier.price}
            />
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.price,
        },
      }),
      columnHelper.accessor('oraclePrice', {
        header: ({ header }) => (
          <HeaderCell definitionTooltipId="oraclePrice" header={header}>
            {t(($) => $.oraclePrice)}
          </HeaderCell>
        ),
        cell: (context) => {
          return (
            <NumberCell
              value={context.getValue()}
              formatSpecifier={context.row.original.formatSpecifier.price}
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.price,
        },
      }),
      columnHelper.accessor('pnlInfo', {
        header: ({ header }) => (
          <HeaderCell
            definitionTooltipId="estimatedPositionPnL"
            header={header}
          >
            {t(($) => $.estimatedAbbrevPnlRoeParens)}
          </HeaderCell>
        ),
        cell: (context) => {
          const { estimatedPnlUsd, estimatedPnlFrac } =
            context.row.original.pnlInfo;
          return (
            <TableCell>
              <PnlValueWithPercentage
                className="flex flex-col gap-y-1.5"
                pnlUsd={estimatedPnlUsd}
                pnlFrac={estimatedPnlFrac}
              />
            </TableCell>
          );
        },
        sortingFn: getKeyedBigNumberSortFn('estimatedPnlUsd'),
        meta: {
          cellContainerClassName: 'min-w-32 max-w-36',
        },
      }),
      columnHelper.accessor('netFunding', {
        header: ({ header }) => (
          <HeaderCell
            definitionTooltipId="perpPositionsFundingPayments"
            header={header}
          >
            {t(($) => $.funding)}
          </HeaderCell>
        ),
        cell: (context) => {
          const netFunding =
            context.getValue<PerpPositionsTableItem['netFunding']>();

          return (
            <CurrencyCell
              className={getSignDependentColorClassName(netFunding)}
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
    ];
  }, [t]);

  return (
    <DataTable
      pagination={undefined}
      columns={columns}
      data={positions}
      isLoading={isLoading}
      largeScreenColumnPinning={{
        left: ['metadata'],
      }}
      emptyState={<EmptyTablePlaceholder type="nlp_positions" />}
    />
  );
}
