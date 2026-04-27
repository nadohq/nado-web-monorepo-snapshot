'use client';

import { WithClassnames } from '@nadohq/web-common';
import { SectionedCard, UnderlinedTabs } from '@nadohq/web-ui';
import {
  TabsContent,
  TabsList,
  Root as TabsRoot,
  TabsTrigger,
} from '@radix-ui/react-tabs';
import { useTabs } from 'client/hooks/ui/tabs/useTabs';
import { ChartTimespan } from 'client/modules/charts/types';
import { NlpOverviewChart } from 'client/pages/Vault/components/NlpOverviewCard/components/NlpOverviewChart';
import { NlpOverviewAboutTabContent } from 'client/pages/Vault/components/NlpOverviewCard/NlpOverviewAboutTabContent';
import { NlpOverviewVaultStatsTabContent } from 'client/pages/Vault/components/NlpOverviewCard/NlpOverviewVaultStatsTabContent';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function NlpOverviewCard({ className }: WithClassnames) {
  const { t } = useTranslation();
  const [timespan, setTimespan] = useState<ChartTimespan>('24h');

  const { setSelectedUntypedTabId, selectedTabId, tabs } = useTabs(
    useMemo(
      () => [
        {
          id: 'about',
          label: t(($) => $.about),
          content: <NlpOverviewAboutTabContent />,
        },
        {
          id: 'stats',
          label: t(($) => $.vaultStats),
          content: (
            <NlpOverviewVaultStatsTabContent selectedTimespan={timespan} />
          ),
        },
      ],
      [timespan, t],
    ),
  );

  return (
    <TabsRoot
      asChild
      value={selectedTabId}
      onValueChange={setSelectedUntypedTabId}
    >
      <SectionedCard className={className}>
        <SectionedCard.Header className="py-0">
          <TabsList className="flex gap-x-6">
            {tabs.map(({ id, label }) => {
              const active = selectedTabId === id;

              return (
                <TabsTrigger asChild value={id} key={id}>
                  <UnderlinedTabs.Button
                    active={active}
                    dataTestId={`nlp-overview-card-tab-trigger-${id}`}
                  >
                    {label}
                  </UnderlinedTabs.Button>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </SectionedCard.Header>
        <SectionedCard.Content className="flex flex-col gap-4 sm:grid sm:grid-cols-5">
          <div className="sm:col-span-2">
            {/*Tab content*/}
            {tabs.map(({ id, content }) => {
              return (
                <TabsContent key={id} value={id} asChild>
                  {content}
                </TabsContent>
              );
            })}
          </div>
          <NlpOverviewChart
            className="sm:col-span-3"
            selectedTimespan={timespan}
            setSelectedTimespan={setTimespan}
          />
        </SectionedCard.Content>
      </SectionedCard>
    </TabsRoot>
  );
}
