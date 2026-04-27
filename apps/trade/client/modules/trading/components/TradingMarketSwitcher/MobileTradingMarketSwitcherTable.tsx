import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { FixedHeaderDataTable } from 'client/components/DataTable/FixedHeaderDataTable';
import {
  bigNumberSortFn,
  booleanSortFn,
} from 'client/components/DataTable/utils/sortingFns';
import { CurrencyCell } from 'client/modules/tables/cells/CurrencyCell';
import { FavoriteHeaderCell } from 'client/modules/tables/cells/FavoriteHeaderCell';
import { FavoriteToggleCell } from 'client/modules/tables/cells/FavoriteToggleCell';
import { MobileMarketSwitcherStackedPriceCell } from 'client/modules/trading/components/BaseMarketSwitcherTable/cells/MarketSwitcherStackedPriceCell';
import { TradingMarketSwitcherProductInfoCell } from 'client/modules/trading/components/TradingMarketSwitcher/TradingMarketSwitcherProductInfoCell';
import {
  MarketSwitcherItem,
  TradingMarketSwitcherTableProps,
} from 'client/modules/trading/components/TradingMarketSwitcher/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<MarketSwitcherItem>();

export function MobileTradingMarketSwitcherTable({
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
            favoriteButtonSize={14}
            disableFavoriteButton={disableFavoriteButton}
          />
        ),
        cell: (context) => (
          <FavoriteToggleCell
            favoriteButtonSize={14}
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
          const { market, isNew, maxLeverage } = context.row.original;

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
          cellContainerClassName: 'w-32 grow',
        },
      }),
      columnHelper.accessor('priceChangeFrac', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.price24hChg)}</HeaderCell>
        ),
        cell: (context) => {
          const { currentPrice, priceChangeFrac, priceIncrement } =
            context.row.original;

          return (
            <MobileMarketSwitcherStackedPriceCell
              priceIncrement={priceIncrement}
              priceChangeFrac={priceChangeFrac}
              currentPrice={currentPrice}
            />
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: 'w-28',
        },
      }),
      columnHelper.accessor('volume24h', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.volume)}</HeaderCell>
        ),
        cell: (context) => {
          const volume24h = context.getValue<MarketSwitcherItem['volume24h']>();

          return (
            <CurrencyCell
              value={volume24h}
              formatSpecifier={PresetNumberFormatSpecifier.NUMBER_INT}
            />
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: 'w-20',
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
      rowClassName="py-2"
      scrollContainerClassName="gap-y-1.5"
    />
  );
}
