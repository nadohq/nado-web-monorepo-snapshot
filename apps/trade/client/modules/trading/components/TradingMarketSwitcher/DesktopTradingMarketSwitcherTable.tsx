import {
  getMarketPriceFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { FixedHeaderDataTable } from 'client/components/DataTable/FixedHeaderDataTable';
import {
  bigNumberSortFn,
  booleanSortFn,
} from 'client/components/DataTable/utils/sortingFns';
import { FavoriteHeaderCell } from 'client/modules/tables/cells/FavoriteHeaderCell';
import { FavoriteToggleCell } from 'client/modules/tables/cells/FavoriteToggleCell';
import { NumberCell } from 'client/modules/tables/cells/NumberCell';
import { PercentageChangeCell } from 'client/modules/tables/cells/PercentageChangeCell';
import { TradingMarketSwitcherProductInfoCell } from 'client/modules/trading/components/TradingMarketSwitcher/TradingMarketSwitcherProductInfoCell';
import {
  MarketSwitcherItem,
  TradingMarketSwitcherTableProps,
} from 'client/modules/trading/components/TradingMarketSwitcher/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<MarketSwitcherItem>();

export function DesktopTradingMarketSwitcherTable({
  disableFavoriteButton,
  toggleIsFavoritedMarket,
  markets,
  isLoading,
  onRowClick,
}: TradingMarketSwitcherTableProps) {
  const { t } = useTranslation();

  const columns: ColumnDef<MarketSwitcherItem, any>[] = useMemo(
    () => [
      columnHelper.accessor('isFavorited', {
        header: ({ header }) => (
          <FavoriteHeaderCell
            header={header}
            favoriteButtonSize={16}
            disableFavoriteButton={disableFavoriteButton}
          />
        ),
        cell: (context) => (
          <FavoriteToggleCell
            favoriteButtonSize={16}
            isFavorited={context.getValue<MarketSwitcherItem['isFavorited']>()}
            disabled={disableFavoriteButton}
            toggleIsFavorited={toggleIsFavoritedMarket}
            productId={context.row.original.productId}
          />
        ),
        sortingFn: booleanSortFn,
        meta: {
          cellContainerClassName: 'w-8',
        },
      }),
      columnHelper.accessor('market', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.market)}</HeaderCell>
        ),
        cell: (context) => {
          const market = context.getValue<MarketSwitcherItem['market']>();
          const isNew = context.row.original.isNew;
          const maxLeverage = context.row.original.maxLeverage;

          return (
            <TradingMarketSwitcherProductInfoCell
              marketName={market.marketName}
              productType={market.productType}
              symbol={market.symbol}
              icon={market.icon}
              isNew={isNew}
              maxLeverage={maxLeverage}
            />
          );
        },
        meta: {
          cellContainerClassName: 'w-52',
        },
      }),
      columnHelper.accessor('currentPrice', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.currentPrice)}</HeaderCell>
        ),
        cell: (context) => {
          const currentPrice =
            context.getValue<MarketSwitcherItem['currentPrice']>();
          const priceIncrement = context.row.original.priceIncrement;

          return (
            <NumberCell
              value={currentPrice}
              formatSpecifier={getMarketPriceFormatSpecifier(priceIncrement)}
              dataTestId="trading-market-switcher-current-price-cell"
            />
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: 'w-28',
        },
      }),
      columnHelper.accessor('priceChangeFrac', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.change24h)}</HeaderCell>
        ),
        cell: (context) => {
          const priceChangeFrac =
            context.getValue<MarketSwitcherItem['priceChangeFrac']>();

          return (
            <PercentageChangeCell
              value={priceChangeFrac}
              dataTestId="trading-market-switcher-price-change-frac-cell"
            />
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: 'w-24',
        },
      }),
      columnHelper.accessor('volume24h', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.volume)}</HeaderCell>
        ),
        cell: (context) => {
          const volume24h = context.getValue<MarketSwitcherItem['volume24h']>();

          return (
            <NumberCell
              value={volume24h}
              formatSpecifier={PresetNumberFormatSpecifier.NUMBER_INT}
              dataTestId="trading-market-switcher-volume-24h-cell"
            />
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: 'w-24',
        },
      }),
      columnHelper.accessor('annualizedFundingFrac', {
        header: ({ header }) => (
          <HeaderCell header={header}>
            {t(($) => $.annualAbbrevFunding)}
          </HeaderCell>
        ),
        cell: (context) => {
          const annualizedFundingFrac =
            context.getValue<MarketSwitcherItem['annualizedFundingFrac']>();

          return (
            <PercentageChangeCell
              value={annualizedFundingFrac}
              formatSpecifier={
                PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_2DP
              }
              dataTestId="trading-market-switcher-annualized-funding-cell"
            />
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: 'w-24',
        },
      }),
    ],
    [disableFavoriteButton, toggleIsFavoritedMarket, t],
  );

  return (
    <FixedHeaderDataTable
      data={markets}
      isLoading={isLoading}
      columns={columns}
      initialSortingState={[{ id: 'isFavorited', desc: false }]}
      rowAsLinkHref={(row) => row.original.href}
      onRowClick={onRowClick}
      emptyState={
        <p className="text-text-tertiary p-2 text-xs">
          {t(($) => $.emptyPlaceholders.noMarketsFound)}
        </p>
      }
      headerClassName="px-1"
      rowClassName="py-0.5 px-1"
      scrollContainerClassName="gap-y-2.5"
      dataTestId="trading-market-switcher-desktop-table"
    />
  );
}
