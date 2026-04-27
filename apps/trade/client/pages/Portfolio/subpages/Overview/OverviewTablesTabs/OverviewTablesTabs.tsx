import { SectionedCard } from '@nadohq/web-ui';
import { TabsContent, Root as TabsRoot } from '@radix-ui/react-tabs';
import { useSubaccountCountIndicators } from 'client/hooks/subaccount/useSubaccountCountIndicators';
import { TableTabs } from 'client/modules/tables/tabs/TableTabs';
import { useOverviewTablesTabs } from 'client/pages/Portfolio/subpages/Overview/OverviewTablesTabs/useOverviewTablesTabs';

export function OverviewTablesTabs() {
  const { tabs, selectedTabId, setSelectedUntypedTabId } =
    useOverviewTablesTabs();

  const countIndicators = useSubaccountCountIndicators();

  return (
    <TabsRoot
      asChild
      value={selectedTabId}
      onValueChange={setSelectedUntypedTabId}
    >
      <SectionedCard>
        <SectionedCard.Header className="py-0">
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
        </SectionedCard.Header>
        <SectionedCard.Content className="p-0">
          {tabs.map(({ id, content }) => (
            <TabsContent key={id} value={id}>
              {content}
            </TabsContent>
          ))}
        </SectionedCard.Content>
      </SectionedCard>
    </TabsRoot>
  );
}
