import { MarketCategory } from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { DropdownUi, SearchBox, useIsMobile } from '@nadohq/web-ui';
import * as Popover from '@radix-ui/react-popover';
import { MarketCategoryFilter } from 'client/components/MarketCategoryFilter/MarketCategoryFilter';
import { DesktopTradingMarketSwitcherTable } from 'client/modules/trading/components/TradingMarketSwitcher/DesktopTradingMarketSwitcherTable';
import { useTradingMarketSwitcher } from 'client/modules/trading/components/TradingMarketSwitcher/hooks/useTradingMarketSwitcher';
import { MobileTradingMarketSwitcherTable } from 'client/modules/trading/components/TradingMarketSwitcher/MobileTradingMarketSwitcherTable';
import { TradingMarketSwitcherPopoverTrigger } from 'client/modules/trading/components/TradingMarketSwitcher/TradingMarketSwitcherPopoverTrigger';
import { MarketSwitcherProps } from 'client/modules/trading/layout/types';
import { useTranslation } from 'react-i18next';

interface TradingMarketSwitcherProps extends MarketSwitcherProps {
  productId: number | undefined;
  defaultMarketCategory: MarketCategory;
}

export function TradingMarketSwitcher({
  productId,
  defaultMarketCategory,
  triggerClassName,
}: TradingMarketSwitcherProps) {
  const { t } = useTranslation();

  const {
    selectedMarket,
    displayedMarkets,
    isLoading,
    disableMarketSwitcherButton,
    selectedMarketCategory,
    setSelectedMarketCategory,
    toggleIsFavoritedMarket,
    isMarketSwitcherOpen,
    setIsMarketSwitcherOpen,
    query,
    setQuery,
    disableFavoriteButton,
  } = useTradingMarketSwitcher(productId, defaultMarketCategory);

  const isMobile = useIsMobile();

  const MarketSwitcherTable = isMobile
    ? MobileTradingMarketSwitcherTable
    : DesktopTradingMarketSwitcherTable;

  return (
    <Popover.Root
      open={isMarketSwitcherOpen}
      onOpenChange={setIsMarketSwitcherOpen}
      // Ensures appropriate body styles are applied so we don't get funky scroll behavior on iOS.
      modal={isMobile}
    >
      <TradingMarketSwitcherPopoverTrigger
        disabled={disableMarketSwitcherButton}
        disableFavoriteButton={disableFavoriteButton}
        open={isMarketSwitcherOpen}
        selectedMarket={selectedMarket}
        className={triggerClassName}
      />
      <Popover.Content
        // Render it flush against the trigger on mobile to save some room.
        sideOffset={isMobile ? 0 : 6}
        align="start"
        asChild
        // Prevent auto-focus on mobile to avoid triggering the keyboard
        onOpenAutoFocus={(event) => {
          if (isMobile) {
            event.preventDefault();
          }
        }}
      >
        <DropdownUi.Content
          className={joinClassNames(
            'bg-surface-card shadow-elevation-strong border-stroke border p-3',
            // See: https://www.radix-ui.com/primitives/docs/components/popover
            // Subtracting "8px" from available height to have a little padding from the screen's edge
            // Cap at 70vh to prevent taking up too much screen space on smaller viewports
            'h-[calc(var(--radix-popover-content-available-height)-8px)] w-(--radix-popover-trigger-width) sm:h-134 sm:max-h-[70vh] sm:w-max',
          )}
        >
          <div className="flex flex-col gap-y-3">
            <SearchBox
              dataTestId="trading-market-switcher-search-box"
              sizeVariant="xs"
              placeholder={t(($) => $.inputPlaceholders.search)}
              query={query}
              setQuery={setQuery}
            />
            <MarketCategoryFilter
              marketCategory={selectedMarketCategory}
              setMarketCategory={setSelectedMarketCategory}
            />
          </div>
          <MarketSwitcherTable
            // Remount the table on category change so we reset the scroll shadow
            // class rather than keeping the one used for the previous category.
            key={selectedMarketCategory}
            disableFavoriteButton={disableFavoriteButton}
            toggleIsFavoritedMarket={toggleIsFavoritedMarket}
            markets={displayedMarkets}
            isLoading={isLoading}
            onRowClick={() => {
              setIsMarketSwitcherOpen(false);
            }}
          />
        </DropdownUi.Content>
      </Popover.Content>
    </Popover.Root>
  );
}
