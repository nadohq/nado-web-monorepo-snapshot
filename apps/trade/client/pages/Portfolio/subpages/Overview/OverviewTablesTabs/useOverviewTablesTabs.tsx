import { useIsMobile } from '@nadohq/web-ui';
import { SubaccountCountIndicatorKey } from 'client/hooks/subaccount/useSubaccountCountIndicators';
import { useTabs } from 'client/hooks/ui/tabs/useTabs';
import { OpenOrdersTableTabContent } from 'client/modules/tables/openOrders/OpenOrdersTableTabContent';
import { PerpPositionsTableTabContent } from 'client/modules/tables/perpPositions/PerpPositionsTableTabContent';
import { SpotBalancesTableTabContent } from 'client/modules/tables/spotBalances/SpotBalancesTableTabContent';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface TableTab {
  id: string;
  label: string;
  countIndicatorKey?: SubaccountCountIndicatorKey;
  content: React.ReactNode;
}

export function useOverviewTablesTabs() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const overviewTablesTabs = useMemo((): TableTab[] => {
    return [
      {
        id: 'balances',
        label: t(($) => $.balances),
        content: <SpotBalancesTableTabContent isMobile={isMobile} />,
      },
      {
        id: 'positions',
        label: t(($) => $.positions),
        countIndicatorKey: 'numPerpPositions',
        content: <PerpPositionsTableTabContent isMobile={isMobile} />,
      },
      {
        id: 'open_orders',
        label: t(($) => $.openOrders),
        countIndicatorKey: 'numOpenOrders',
        content: <OpenOrdersTableTabContent isMobile={isMobile} />,
      },
    ];
  }, [isMobile, t]);

  return useTabs(overviewTablesTabs);
}
