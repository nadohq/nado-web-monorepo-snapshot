import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import {
  bigNumberSortFn,
  booleanSortFn,
} from 'client/components/DataTable/utils/sortingFns';
import { ProductLabel } from 'client/components/ProductLabel';
import { ProductLabelLink } from 'client/components/ProductLabelLink';
import { FavoriteHeaderCell } from 'client/modules/tables/cells/FavoriteHeaderCell';
import { FavoriteToggleCell } from 'client/modules/tables/cells/FavoriteToggleCell';
import { NumberCell } from 'client/modules/tables/cells/NumberCell';
import { PercentageChangeCell } from 'client/modules/tables/cells/PercentageChangeCell';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { FundingRatePeriodSelect } from 'client/modules/trading/components/FundingRatePeriodSelect';
import { FundingRateCountdown } from 'client/pages/Markets/components/FundingRateCountdown';
import {
  FundingRateTableItem,
  useFundingRateMarketsTable,
} from 'client/pages/Markets/hooks/useFundingRateMarketsTable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<FundingRateTableItem>();

export function FundingRateMarketsTable({ query }: { query: string }) {
  const { t } = useTranslation();
  const {
    isLoading,
    fundingRateData,
    disableFavoriteButton,
    toggleIsFavoritedMarket,
  } = useFundingRateMarketsTable({ query });

  const columns: ColumnDef<FundingRateTableItem, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('isFavorited', {
        header: ({ header }) => (
          <FavoriteHeaderCell
            header={header}
            disableFavoriteButton={disableFavoriteButton}
            favoriteButtonSize={12}
          />
        ),
        cell: (context) => {
          return (
            <FavoriteToggleCell
              isFavorited={context.getValue()}
              disabled={disableFavoriteButton}
              toggleIsFavorited={toggleIsFavoritedMarket}
              productId={context.row.original.productId}
              favoriteButtonSize={15}
            />
          );
        },
        sortingFn: booleanSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.favorite,
        },
      }),
      columnHelper.accessor('metadata', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.market)}</HeaderCell>
        ),
        cell: (context) => {
          const value = context.getValue<FundingRateTableItem['metadata']>();
          return (
            <TableCell>
              <ProductLabelLink productId={context.row.original.productId}>
                <ProductLabel
                  symbol={value.marketName}
                  iconSrc={value.icon.asset}
                />
              </ProductLabelLink>
            </TableCell>
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.product,
        },
      }),
      columnHelper.accessor('markPrice', {
        header: ({ header }) => (
          <HeaderCell header={header}>
            {t(($) => $.marketsPage.markPrice)}
          </HeaderCell>
        ),
        cell: (context) => {
          return (
            <NumberCell
              value={context.getValue()}
              formatSpecifier={context.row.original.marketPriceFormatSpecifier}
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.price,
        },
      }),
      columnHelper.accessor('indexPrice', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.indexPrice)}</HeaderCell>
        ),
        cell: (context) => {
          return (
            <NumberCell
              value={context.getValue()}
              formatSpecifier={context.row.original.marketPriceFormatSpecifier}
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.price,
        },
      }),
      columnHelper.accessor('periodPredictedRate', {
        header: ({ header }) => (
          <HeaderCell header={header}>
            {t(($) => $.marketsPage.predicted)}
          </HeaderCell>
        ),
        cell: (context) => (
          <PercentageChangeCell
            value={context.getValue()}
            formatSpecifier={PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_4DP}
          />
        ),
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.percentage,
        },
      }),
      columnHelper.accessor('dailyAvg', {
        header: ({ header }) => (
          <HeaderCell header={header}>
            {t(($) => $.marketsPage.avg24h)}
          </HeaderCell>
        ),
        cell: (context) => (
          <PercentageChangeCell
            value={context.getValue()}
            formatSpecifier={PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_4DP}
          />
        ),
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.percentage,
        },
      }),
      columnHelper.accessor('threeDayAvg', {
        header: ({ header }) => (
          <HeaderCell header={header}>
            {t(($) => $.marketsPage.avg3d)}
          </HeaderCell>
        ),
        cell: (context) => (
          <PercentageChangeCell
            value={context.getValue()}
            formatSpecifier={PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_4DP}
          />
        ),
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.percentage,
        },
      }),
      columnHelper.accessor('weeklyAvg', {
        header: ({ header }) => (
          <HeaderCell header={header}>
            {t(($) => $.marketsPage.avg7d)}
          </HeaderCell>
        ),
        cell: (context) => (
          <PercentageChangeCell
            value={context.getValue()}
            formatSpecifier={PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_4DP}
          />
        ),
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.percentage,
        },
      }),
      columnHelper.accessor('monthlyAvg', {
        header: ({ header }) => (
          <HeaderCell header={header}>
            {t(($) => $.marketsPage.avg30d)}
          </HeaderCell>
        ),
        cell: (context) => (
          <PercentageChangeCell
            value={context.getValue()}
            formatSpecifier={PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_4DP}
          />
        ),
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.percentage,
        },
      }),
    ];
  }, [t, disableFavoriteButton, toggleIsFavoritedMarket]);

  return (
    <>
      <div className="text-stroke-tertiary flex items-center justify-between gap-x-4 text-xs">
        <div className="flex items-center gap-x-1">
          <span>{t(($) => $.standardizeRatesTo)}</span>
          <FundingRatePeriodSelect />
        </div>
        <FundingRateCountdown />
      </div>
      <DataTable<FundingRateTableItem>
        isLoading={isLoading}
        columns={columns}
        data={fundingRateData}
        pagination={undefined}
        emptyState={<EmptyTablePlaceholder type="markets" />}
      />
    </>
  );
}
