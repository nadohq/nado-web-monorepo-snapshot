import { joinClassNames } from '@nadohq/web-common';
import {
  Divider,
  DropdownUi,
  PillTabs,
  ScrollShadowsContainer,
  SearchBox,
  TextButton,
  UnderlinedTabs,
  useIsMobile,
} from '@nadohq/web-ui';
import * as Popover from '@radix-ui/react-popover';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { TabsList, Root as TabsRoot, TabsTrigger } from '@radix-ui/react-tabs';
import { FavoriteButton } from 'client/components/ActionButtons/FavoriteButton';
import { DesktopTradingMarketSwitcherTable } from 'client/modules/trading/components/TradingMarketSwitcher/DesktopTradingMarketSwitcherTable';
import { useTradingMarketSwitcher } from 'client/modules/trading/components/TradingMarketSwitcher/hooks/useTradingMarketSwitcher';
import { MobileTradingMarketSwitcherTable } from 'client/modules/trading/components/TradingMarketSwitcher/MobileTradingMarketSwitcherTable';
import { TradingMarketSwitcherPopoverTrigger } from 'client/modules/trading/components/TradingMarketSwitcher/TradingMarketSwitcherPopoverTrigger';
import { MarketSwitcherProps } from 'client/modules/trading/layout/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface TradingMarketSwitcherProps extends MarketSwitcherProps {
  productId: number | undefined;
}

export function TradingMarketSwitcher({
  productId,
  triggerClassName,
}: TradingMarketSwitcherProps) {
  const { t } = useTranslation();

  const {
    selectedMarket,
    displayedMarkets,
    isLoading,
    disableMarketSwitcherButton,
    toggleIsFavoritedMarket,
    isMarketSwitcherOpen,
    setIsMarketSwitcherOpen,
    query,
    setQuery,
    disableFavoriteButton,
    showFavoritesOnly,
    setShowFavoritesOnly,
    selectedProductTypeFilterId,
    setSelectedProductTypeFilterId,
    productTypeFilterOptions,
    selectedMarketCategoryFilterId,
    setSelectedMarketCategoryFilterId,
    marketCategoryFilterOptions,
    resetFilters,
  } = useTradingMarketSwitcher(productId);

  const emptyState = useMemo(() => {
    return (
      <div className="flex flex-col items-center justify-center gap-y-1.5 py-12 text-sm">
        <p className="text-text-tertiary">
          {t(($) => $.emptyPlaceholders.noMarketsFound)}
        </p>
        <TextButton colorVariant="primary" onClick={resetFilters}>
          {t(($) => $.buttons.reset)}
        </TextButton>
      </div>
    );
  }, [t, resetFilters]);

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
            'flex flex-col gap-y-1.5 pb-1.5',
            'bg-surface-card shadow-elevation-strong border-stroke border',
            // See: https://www.radix-ui.com/primitives/docs/components/popover
            // Subtracting "8px" from available height to have a little padding from the screen's edge
            // Cap at 70vh to prevent taking up too much screen space on smaller viewports
            'h-[calc(var(--radix-popover-content-available-height)-8px)] w-(--radix-popover-trigger-width) sm:h-134 sm:max-h-[70vh] sm:w-max',
          )}
        >
          <div className="flex flex-col py-3">
            <div className="px-3">
              <SearchBox
                dataTestId="trading-market-switcher-search-box"
                placeholder={t(($) => $.inputPlaceholders.search)}
                query={query}
                setQuery={setQuery}
              />
            </div>
            <div className="flex items-center gap-x-3 p-3 text-sm">
              <FavoriteButton
                className="p-1.5"
                isFavorited={showFavoritesOnly}
                size={14}
                onClick={() => setShowFavoritesOnly((prev) => !prev)}
              />
              <Divider vertical />
              <RadioGroup.Root
                className="flex gap-x-1.5"
                onValueChange={setSelectedProductTypeFilterId}
                value={selectedProductTypeFilterId as string}
              >
                {productTypeFilterOptions.map(({ value, label }) => {
                  return (
                    <RadioGroup.Item
                      key={value}
                      value={value as string}
                      asChild
                    >
                      <PillTabs.Button
                        sizeVariant="sm"
                        dataTestId={`trading-market-switcher-product-type-filter-${value}`}
                        active={selectedProductTypeFilterId === value}
                      >
                        {label}
                      </PillTabs.Button>
                    </RadioGroup.Item>
                  );
                })}
              </RadioGroup.Root>
            </div>
            <TabsRoot
              asChild
              value={selectedMarketCategoryFilterId}
              onValueChange={setSelectedMarketCategoryFilterId}
            >
              <TabsList asChild>
                <ScrollShadowsContainer
                  orientation="horizontal"
                  className="border-overlay-divider flex items-center gap-x-3 border-y px-3 whitespace-nowrap"
                >
                  {marketCategoryFilterOptions.map(({ value, label }) => {
                    return (
                      <TabsTrigger asChild key={value} value={value as string}>
                        <UnderlinedTabs.Button
                          dataTestId={`trading-market-switcher-category-filter-${value}`}
                          // Using min-w to ensure sensible touch target for 'All' in all languages
                          className="min-w-8 text-xs"
                          active={selectedMarketCategoryFilterId === value}
                        >
                          {label}
                        </UnderlinedTabs.Button>
                      </TabsTrigger>
                    );
                  })}
                </ScrollShadowsContainer>
              </TabsList>
            </TabsRoot>
          </div>
          <MarketSwitcherTable
            // Remount the table on filter change so we reset the scroll shadow class
            key={`${showFavoritesOnly}-${selectedProductTypeFilterId}-${selectedMarketCategoryFilterId}`}
            disableFavoriteButton={disableFavoriteButton}
            toggleIsFavoritedMarket={toggleIsFavoritedMarket}
            emptyState={emptyState}
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
