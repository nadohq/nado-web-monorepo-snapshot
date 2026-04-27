import { useIsMobile } from '@nadohq/web-ui';
import { MobileTradingSpreadsTab } from 'client/modules/tables/spreads/MobileTradingSpreadsTab';
import { TradingSpreadsTable } from 'client/modules/tables/spreads/TradingSpreadsTable';
import { useTradingTableTabsFilters } from 'client/modules/trading/components/TradingTableTabs/TradingTableTabsFilters/useTradingTableTabsFilters';

export function TradingSpreadsTabContent() {
  const { visibleProductIds } = useTradingTableTabsFilters();
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileTradingSpreadsTab productIds={visibleProductIds} />;
  }
  return <TradingSpreadsTable productIds={visibleProductIds} />;
}
