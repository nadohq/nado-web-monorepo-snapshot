'use client';

import { SectionedCard } from '@nadohq/web-ui';
import { Content as TabsContent, Root as TabsRoot } from '@radix-ui/react-tabs';
import { TableTabs } from 'client/modules/tables/tabs/TableTabs';
import { useMarketsTableTabs } from 'client/pages/Markets/components/MarketTableTabs/useMarketsTableTabs';

export function MarketsTableTabs() {
  const { tabs, selectedTabId, setSelectedUntypedTabId } =
    useMarketsTableTabs();

  return (
    <TabsRoot
      asChild
      value={selectedTabId}
      onValueChange={setSelectedUntypedTabId}
    >
      <SectionedCard>
        <SectionedCard.Header className="py-0">
          <TableTabs.TabsList>
            {tabs.map(({ id, label }) => {
              return (
                <TableTabs.TabsTrigger
                  key={id}
                  id={id}
                  active={selectedTabId === id}
                >
                  {label}
                </TableTabs.TabsTrigger>
              );
            })}
          </TableTabs.TabsList>
        </SectionedCard.Header>
        <SectionedCard.Content>
          {tabs.map(({ id, content }) => (
            <TabsContent value={id} key={id}>
              {content}
            </TabsContent>
          ))}
        </SectionedCard.Content>
      </SectionedCard>
    </TabsRoot>
  );
}
