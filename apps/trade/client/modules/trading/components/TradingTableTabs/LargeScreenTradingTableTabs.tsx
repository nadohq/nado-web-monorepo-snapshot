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

interface Props extends WithClassnames {
  productId: number | undefined;
}

export function LargeScreenTradingTableTabs({ productId, className }: Props) {
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
      <TabsRoot asChild value={selectedTabId} onValueChange={setSelectedTabId}>
        {/* Parent layouts should provide a height constraint so SectionedCard.Content scrolls instead of expanding the card. */}
        <SectionedCard className={className}>
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
          <SectionedCard.Content className="overflow-y-auto p-0">
            {tabs.map(({ id, content }) => (
              <TabsContent
                key={id}
                value={id}
                data-testid={`table-tabs-content-${id}`}
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
