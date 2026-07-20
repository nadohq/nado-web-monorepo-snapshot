import { useTabs } from 'client/hooks/ui/tabs/useTabs';
import { TRADING_COMP_TRACKS } from 'client/modules/tradingCompetition/consts';

const LEADERBOARD_TABS = TRADING_COMP_TRACKS.map((track) => ({
  id: track.type,
  type: track.type,
  rankType: track.rankType,
  contestId: track.contestId,
}));

export function useTradingCompLeaderboardTableTabs() {
  const { tabs, selectedTab, selectedTabId, setSelectedUntypedTabId } =
    useTabs(LEADERBOARD_TABS);

  return {
    tabs,
    selectedTabId,
    setSelectedUntypedTabId,
    selectedTab,
  };
}
