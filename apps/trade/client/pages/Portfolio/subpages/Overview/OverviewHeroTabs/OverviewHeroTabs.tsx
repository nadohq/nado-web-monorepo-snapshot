import { SectionedCard, UnderlinedTabs } from '@nadohq/web-ui';
import {
  TabsContent,
  TabsList,
  Root as TabsRoot,
  TabsTrigger,
} from '@radix-ui/react-tabs';
import { TimespanSelect } from 'client/modules/charts/components/TimespanSelect';
import { useOverviewHeroTabs } from 'client/pages/Portfolio/subpages/Overview/OverviewHeroTabs/useOverviewHeroTabs';
import { portfolioTimespanAtom } from 'client/store/portfolioStore';
import { useAtom } from 'jotai';

export function OverviewHeroTabs() {
  const [timespan, setTimespan] = useAtom(portfolioTimespanAtom);
  const { tabs, selectedTabId, setSelectedUntypedTabId } =
    useOverviewHeroTabs();

  const headerContent = (
    <TabsList className="flex flex-1 items-center justify-between">
      <div className="flex items-center gap-x-6">
        {tabs.map(({ id, label }) => {
          return (
            <TabsTrigger asChild value={id} key={id}>
              <UnderlinedTabs.Button active={selectedTabId === id}>
                {label}
              </UnderlinedTabs.Button>
            </TabsTrigger>
          );
        })}
      </div>
      <TimespanSelect
        selectedTimespan={timespan}
        setSelectedTimespan={setTimespan}
      />
    </TabsList>
  );

  return (
    <TabsRoot
      asChild
      value={selectedTabId}
      onValueChange={setSelectedUntypedTabId}
    >
      <SectionedCard>
        <SectionedCard.Header className="py-0">
          {headerContent}
        </SectionedCard.Header>
        <SectionedCard.Content>
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
