import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { SectionedCard } from '@nadohq/web-ui';
import { TabsContent, Root as TabsRoot } from '@radix-ui/react-tabs';
import { useSubaccountCountIndicators } from 'client/hooks/subaccount/useSubaccountCountIndicators';
import { useTabs } from 'client/hooks/ui/tabs/useTabs';
import { TableTabs } from 'client/modules/tables/tabs/TableTabs';
import { MobileTradingTabDisplayFilterPopover } from 'client/modules/trading/components/TradingTableTabs/MobileTradingTabDisplayFilterPopover';
import {
  TradingTableTabsFiltersContext,
  TradingTableTabsFiltersContextData,
} from 'client/modules/trading/components/TradingTableTabs/TradingTableTabsFilters/TradingTableTabsFiltersContext';
import { useTradingTableTabs } from 'client/modules/trading/hooks/useTradingTableTabs';
import { useMemo } from 'react';

export function MobileTradingTableTabs({
  productId,
  className,
}: WithClassnames<{
  productId: number | undefined;
}>) {
  const tradingTabs = useTradingTableTabs();

  const {
    selectedTab: { displayFilter },
    selectedTabId,
    setSelectedTabId,
    tabs,
  } = useTabs(tradingTabs);
  const countIndicators = useSubaccountCountIndicators();

  const filtersContextData = useMemo<TradingTableTabsFiltersContextData>(() => {
    return { productId, displayFilter };
  }, [productId, displayFilter]);

  return (
    <TradingTableTabsFiltersContext value={filtersContextData}>
      <TabsRoot
        // Using `flex-col` to stretch the tab list and tab content.
        className={joinClassNames('flex flex-col', className)}
        value={selectedTabId}
        onValueChange={setSelectedTabId}
      >
        <SectionedCard>
          <SectionedCard.Header className="flex justify-between gap-x-2 py-0">
            <TableTabs.TabsList>
              {tradingTabs.map(({ countIndicatorKey, id, label }) => {
                const associatedCount = countIndicatorKey
                  ? countIndicators[countIndicatorKey]
                  : undefined;
                return (
                  <TableTabs.TabsTrigger
                    key={id}
                    id={id}
                    active={selectedTabId === id}
                    associatedCount={associatedCount}
                  >
                    {label}
                  </TableTabs.TabsTrigger>
                );
              })}
            </TableTabs.TabsList>
            <MobileTradingTabDisplayFilterPopover />
          </SectionedCard.Header>
          <SectionedCard.Content className="p-0">
            {tabs.map(({ id, content }) => (
              <TabsContent
                key={id}
                value={id}
                // Min height to reduce the amount of scroll jump when switching between
                // tabs with a different number of cards.
                // Only apply `flex` when active to avoid overriding `display: none` applied
                // to non-active tab content containers.
                className="min-h-40 flex-col data-[state=active]:flex"
              >
                {content}
              </TabsContent>
            ))}
          </SectionedCard.Content>
        </SectionedCard>
      </TabsRoot>
    </TradingTableTabsFiltersContext>
  );
}
