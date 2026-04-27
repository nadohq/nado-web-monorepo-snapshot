'use client';

import { WithClassnames } from '@nadohq/web-common';
import { SectionedCard } from '@nadohq/web-ui';
import { TabsContent, Root as TabsRoot } from '@radix-ui/react-tabs';
import { useTabs } from 'client/hooks/ui/tabs/useTabs';
import { TableTabs } from 'client/modules/tables/tabs/TableTabs';
import { useNlpTableTabs } from 'client/pages/Vault/components/NlpTableTabs/useNlpTableTabs';

export function NlpTableTabs({ className }: WithClassnames) {
  const nlpTableTabs = useNlpTableTabs();
  const { selectedTabId, setSelectedTabId, tabs } = useTabs(nlpTableTabs);

  return (
    <TabsRoot
      className={className}
      value={selectedTabId}
      onValueChange={setSelectedTabId}
      asChild
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
        <SectionedCard.Content className="p-0">
          {tabs.map(({ id, content }) => (
            <TabsContent
              key={id}
              value={id}
              // Use a min-height here to prevent layout shift when switching tabs
              className="min-h-[400px]"
            >
              {content}
            </TabsContent>
          ))}
        </SectionedCard.Content>
      </SectionedCard>
    </TabsRoot>
  );
}
