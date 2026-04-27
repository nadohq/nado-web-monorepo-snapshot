import { useIsMobile } from '@nadohq/web-ui';
import { SpotBalancesTableTabContent } from 'client/modules/tables/spotBalances/SpotBalancesTableTabContent';
import { useTradingTableTabsFilters } from 'client/modules/trading/components/TradingTableTabs/TradingTableTabsFilters/useTradingTableTabsFilters';

export function TradingSpotBalancesTabContent() {
  const { hideSmallBalances } = useTradingTableTabsFilters();
  const isMobile = useIsMobile();

  return (
    <SpotBalancesTableTabContent
      hideSmallBalances={hideSmallBalances}
      isMobile={isMobile}
    />
  );
}
