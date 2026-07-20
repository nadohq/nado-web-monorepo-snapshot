import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { FixedHeaderDataTable } from 'client/components/DataTable/FixedHeaderDataTable';
import {
  bigNumberSortFn,
  booleanSortFn,
} from 'client/components/DataTable/utils/sortingFns';
import { CurrencyCell } from 'client/modules/tables/cells/CurrencyCell';
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
  emptyState,
}: TradingMarketSwitcherTableProps) {
  const { t } = useTranslation();

  const columns: ColumnDef<MarketSwitcherItem, any>[] = useMemo(
    () => [
      columnHelper.accessor('isFavorited', {
        header: () => null,
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
          const {
            market,
            isNew,
            isXStock,
            isZeroFees,
            maxLeverage,
            pointsBoost,
          } = context.row.original;

          return (
            <TradingMarketSwitcherProductInfoCell
              marketName={market.marketName}
              productType={market.productType}
              symbol={market.symbol}
              icon={market.icon}
              isNew={isNew}
              isXStock={isXStock}
              isZeroFees={isZeroFees}
              maxLeverage={maxLeverage}
              pointsBoost={pointsBoost}
              isMobile
            />
          );
        },
        meta: {
          cellContainerClassName: 'w-32 grow',
        },
      }),
      columnHelper.accessor('priceChangeFrac', {
        header: ({ header }) => (
          <HeaderCell sortingIconFirst header={header}>
            {t(($) => $.price)}
          </HeaderCell>
        ),
        cell: (context) => {
          const { currentPrice, priceChangeFrac, priceFormatSpecifier } =
            context.row.original;

          return (
            <MobileMarketSwitcherStackedPriceCell
              priceFormatSpecifier={priceFormatSpecifier}
              priceChangeFrac={priceChangeFrac}
              currentPrice={currentPrice}
            />
          );
        },
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: 'w-22 flex justify-end',
        },
      }),
      columnHelper.accessor('volume24h', {
        header: ({ header }) => (
          <HeaderCell sortingIconFirst header={header}>
            {t(($) => $.volume)}
          </HeaderCell>
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
          cellContainerClassName: 'w-22 flex justify-end mr-1.5',
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
      initialSortingState={[
        { id: 'isFavorited', desc: false },
        { id: 'volume24h', desc: true },
      ]}
      rowAsLinkHref={(row) => row.original.href}
      onRowClick={onRowClick}
      emptyState={emptyState}
      rowClassName="py-2"
      scrollContainerClassName="gap-y-1.5"
    />
  );
}
