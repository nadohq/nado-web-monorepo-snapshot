import { WithClassnames } from '@nadohq/web-common';
import { SectionedCard } from '@nadohq/web-ui';
import { TabsContent, Root as TabsRoot } from '@radix-ui/react-tabs';
import { useSubaccountCountIndicators } from 'client/hooks/subaccount/useSubaccountCountIndicators';
import { useTabs } from 'client/hooks/ui/tabs/useTabs';
import { TableTabs } from 'client/modules/tables/tabs/TableTabs';
import { TradingTableTabsFilterCheckbox } from 'client/modules/trading/components/TradingTableTabs/TradingTableTabsFilters/TradingTableTabsFilters';
import {
  TradingTableTabsFiltersContext,
  TradingTableTabsFiltersContextData,
} from 'client/modules/trading/components/TradingTableTabs/TradingTableTabsFilters/TradingTableTabsFiltersContext';
import { useTradingTableTabs } from 'client/modules/trading/hooks/useTradingTableTabs';
import { useMemo } from 'react';

export function LargeScreenTradingTableTabs({
  productId,
  className,
}: WithClassnames<{
  productId: number | undefined;
}>) {
  const tradingTableTabs = useTradingTableTabs();

  const {
    selectedTab: { displayFilter },
    selectedTabId,
    setSelectedTabId,
    tabs,
  } = useTabs(tradingTableTabs);

  const countIndicators = useSubaccountCountIndicators();

  const filtersContextData = useMemo<TradingTableTabsFiltersContextData>(() => {
    return { productId, displayFilter };
  }, [productId, displayFilter]);

  return (
    <TradingTableTabsFiltersContext value={filtersContextData}>
      <TabsRoot
        className={className}
        value={selectedTabId}
        onValueChange={setSelectedTabId}
      >
        <SectionedCard>
          <SectionedCard.Header className="flex justify-between gap-x-4 py-0">
            <TableTabs.TabsList>
              {tabs.map(({ id, label, countIndicatorKey }) => {
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
            <TradingTableTabsFilterCheckbox />
          </SectionedCard.Header>
          <SectionedCard.Content className="p-0">
            {tabs.map(({ id, content }) => (
              <TabsContent
                key={id}
                value={id}
                data-testid={`table-tabs-content-${id}`}
                // Use a min-height here to prevent layout shift when switching tabs
                className="min-h-[400px]"
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
