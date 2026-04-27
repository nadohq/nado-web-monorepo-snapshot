import { useTabs } from 'client/hooks/ui/tabs/useTabs';
import { OverviewAccountMetricItemsContent } from 'client/pages/Portfolio/subpages/Overview/OverviewHeroTabs/OverviewAccountMetricItemsContent';
import { OverviewPnlMetricItemsContent } from 'client/pages/Portfolio/subpages/Overview/OverviewHeroTabs/OverviewPnlMetricItemsContent';
import { OverviewVolumeMetricItemsContent } from 'client/pages/Portfolio/subpages/Overview/OverviewHeroTabs/OverviewVolumeMetricItemsContent';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useOverviewHeroTabs() {
  const { t } = useTranslation();

  const overviewTabs = useMemo(
    () => [
      {
        id: 'account',
        label: t(($) => $.account),
        content: <OverviewAccountMetricItemsContent />,
      },
      {
        id: 'pnl',
        label: t(($) => $.pnl),
        content: <OverviewPnlMetricItemsContent />,
      },
      {
        id: 'volume',
        label: t(($) => $.volume),
        content: <OverviewVolumeMetricItemsContent />,
      },
    ],
    [t],
  );

  const { tabs, selectedTabId, setSelectedUntypedTabId } =
    useTabs(overviewTabs);

  return {
    tabs,
    selectedTabId,
    setSelectedUntypedTabId,
  };
}
