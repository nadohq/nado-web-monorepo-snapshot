'use client';

import { joinClassNames } from '@nadohq/web-common';
import { UnderlinedTabs } from '@nadohq/web-ui';
import {
  Content as TabsContent,
  TabsList,
  Root as TabsRoot,
  TabsTrigger,
} from '@radix-ui/react-tabs';
import { TimeframeSelect } from 'client/components/TimeframeSelect/TimeframeSelect';
import { OpenInterestFundingAndLiquidationsTabContent } from 'client/pages/MainPage/components/OpenInterestFundingAndLiquidationsTabContent/OpenInterestFundingAndLiquidationsTabContent';
import { OverviewTabContent } from 'client/pages/MainPage/components/OverviewTabContent/OverviewTabContent';
import { RevenueAndUsersTabContent } from 'client/pages/MainPage/components/RevenueAndUsersTabContent/RevenueAndUsersTabContent';
import { TvlAndYieldTabContent } from 'client/pages/MainPage/components/TvlAndYieldTabContent/TvlAndYieldTabContent';
import { VolumesTabContent } from 'client/pages/MainPage/components/VolumesTabContent/VolumesTabContent';
import { useState } from 'react';

const TABS = [
  {
    id: 'overview',
    label: 'Overview',
    content: <OverviewTabContent />,
  },
  {
    id: 'volumes',
    label: 'Volumes',
    content: <VolumesTabContent />,
  },
  {
    id: 'open_interest_funding_and_liquidations',
    label: 'OI, Funding & Liquidations',
    content: <OpenInterestFundingAndLiquidationsTabContent />,
  },
  {
    id: 'revenue_and_users',
    label: 'Revenue & Users',
    content: <RevenueAndUsersTabContent />,
  },
  {
    id: 'tvl_and_yield',
    label: 'TVL & Yield',
    content: <TvlAndYieldTabContent />,
  },
];

export function DashboardTabs() {
  const [selectedTabId, setSelectedTabId] = useState(TABS[0].id);

  return (
    <TabsRoot
      className="flex flex-col gap-y-4 sm:gap-y-8"
      value={selectedTabId}
      onValueChange={setSelectedTabId}
    >
      <div
        className={joinClassNames(
          'flex flex-col justify-start gap-2.5',
          'sm:flex-row sm:items-center sm:justify-between',
        )}
      >
        <TabsList className="no-scrollbar flex gap-x-6 overflow-auto">
          {TABS.map(({ id, label }) => {
            return (
              <TabsTrigger asChild value={id} key={id}>
                <UnderlinedTabs.Button
                  active={selectedTabId === id}
                  className="font-semibold"
                >
                  {label}
                </UnderlinedTabs.Button>
              </TabsTrigger>
            );
          })}
        </TabsList>
        <TimeframeSelect />
      </div>

      {TABS.map(({ id, content }) => (
        <TabsContent
          className="flex flex-col gap-y-7 empty:hidden"
          value={id}
          key={id}
        >
          {content}
        </TabsContent>
      ))}
    </TabsRoot>
  );
}
