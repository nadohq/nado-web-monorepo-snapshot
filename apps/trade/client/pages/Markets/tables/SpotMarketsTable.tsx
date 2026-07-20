import {
  PresetNumberFormatSpecifier,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { LinkButton } from '@nadohq/web-ui';
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
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { FavoriteHeaderCell } from 'client/modules/tables/cells/FavoriteHeaderCell';
import { FavoriteToggleCell } from 'client/modules/tables/cells/FavoriteToggleCell';
import { NumberCell } from 'client/modules/tables/cells/NumberCell';
import { PercentageChangeCell } from 'client/modules/tables/cells/PercentageChangeCell';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import {
  SpotMarketTableItem,
  useSpotMarketsTable,
} from 'client/pages/Markets/hooks/useSpotMarketsTable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<SpotMarketTableItem>();

export function SpotMarketsTable({ query }: { query: string }) {
  const { t } = useTranslation();
  const { primaryQuoteToken } = useNadoMetadataContext();
  const {
    isLoading,
    spotProducts,
    toggleIsFavoritedMarket,
    disableFavoriteButton,
  } = useSpotMarketsTable({ query });
  const { show } = useDialog();

  const columns: ColumnDef<SpotMarketTableItem, any>[] = useMemo(() => {
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
          const value = context.getValue<SpotMarketTableItem['metadata']>();
          return (
            <TableCell>
              <ProductLabelLink productId={context.row.original.productId}>
                <ProductLabel
                  symbol={value.marketName}
                  iconSrc={value.token.icon.asset}
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
      columnHelper.accessor('currentPrice', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.price)}</HeaderCell>
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
      columnHelper.accessor('priceChangeFrac24h', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.priceChange24h)}</HeaderCell>
        ),
        cell: (context) => <PercentageChangeCell value={context.getValue()} />,
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.percentage,
        },
      }),
      columnHelper.accessor('volume24h', {
        header: ({ header }) => (
          <HeaderCell header={header}>
            {t(($) => $.marketsPage.volume24hWithSymbol, {
              symbol: primaryQuoteToken.symbol,
            })}
          </HeaderCell>
        ),
        cell: (context) => (
          <NumberCell
            value={context.getValue()}
            formatSpecifier={PresetNumberFormatSpecifier.NUMBER_INT}
          />
        ),
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => null,
        cell: (context) => {
          const productId = context.row.original.productId;

          return (
            <TableCell>
              <LinkButton
                colorVariant="secondary"
                className="pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  show({ type: 'market_details', params: { productId } });
                }}
              >
                {t(($) => $.marketsPage.moreDetails)}
              </LinkButton>
            </TableCell>
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.actions,
        },
      }),
    ];
  }, [
    t,
    show,
    disableFavoriteButton,
    toggleIsFavoritedMarket,
    primaryQuoteToken.symbol,
  ]);

  return (
    <DataTable<SpotMarketTableItem>
      isLoading={isLoading}
      columns={columns}
      data={spotProducts}
      pagination={undefined}
      emptyState={<EmptyTablePlaceholder type="markets" />}
    />
  );
}
