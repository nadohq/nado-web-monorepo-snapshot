'use client';

import { OverviewHeroTabs } from 'client/pages/Portfolio/subpages/Overview/OverviewHeroTabs/OverviewHeroTabs';
import { OverviewInfoCards } from 'client/pages/Portfolio/subpages/Overview/OverviewInfoCards/OverviewInfoCards';
import { OverviewTablesTabs } from 'client/pages/Portfolio/subpages/Overview/OverviewTablesTabs/OverviewTablesTabs';

export function PortfolioOverviewSubpage() {
  return (
    <div className="flex flex-col gap-y-1">
      <OverviewInfoCards />
      <OverviewHeroTabs />
      <OverviewTablesTabs />
    </div>
  );
}
