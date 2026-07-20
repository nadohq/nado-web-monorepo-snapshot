'use client';

import { SectionedCard, SegmentedControl } from '@nadohq/web-ui';
import { TradingCompLeaderboardTable } from 'client/pages/TradingCompetition/components/TradingCompLeaderboardTableTabsCard/TradingCompLeaderboardTable';
import { useTradingCompLeaderboardTableTabs } from 'client/pages/TradingCompetition/components/TradingCompLeaderboardTableTabsCard/useTradingCompLeaderboardTableTabs';
import { useTranslation } from 'react-i18next';

export function TradingCompLeaderboardTableTabsCard() {
  const { t } = useTranslation();
  const { tabs, selectedTabId, setSelectedUntypedTabId, selectedTab } =
    useTradingCompLeaderboardTableTabs();

  const { contestId, rankType } = selectedTab;

  return (
    <SectionedCard>
      <SectionedCard.Header className="flex items-center justify-between">
        <span>{t(($) => $.tradingCompetition.leaderboard)}</span>
        <SegmentedControl.Container>
          {tabs.map((tab) => (
            <SegmentedControl.Button
              key={tab.id}
              className="w-20"
              size="xs"
              active={selectedTabId === tab.id}
              onClick={() => setSelectedUntypedTabId(tab.id)}
            >
              {t(($) => $.tradingCompetition.tracks[tab.type])}
            </SegmentedControl.Button>
          ))}
        </SegmentedControl.Container>
      </SectionedCard.Header>
      <SectionedCard.Content className="p-0 pb-3">
        <TradingCompLeaderboardTable
          contestId={contestId}
          rankType={rankType}
        />
      </SectionedCard.Content>
    </SectionedCard>
  );
}
