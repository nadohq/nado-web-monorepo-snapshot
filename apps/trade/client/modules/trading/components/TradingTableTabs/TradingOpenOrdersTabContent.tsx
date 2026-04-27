import { useIsMobile } from '@nadohq/web-ui';
import { OpenOrdersTableTabContent } from 'client/modules/tables/openOrders/OpenOrdersTableTabContent';
import { useTradingTableTabsFilters } from 'client/modules/trading/components/TradingTableTabs/TradingTableTabsFilters/useTradingTableTabsFilters';

export function TradingOpenOrdersTabContent() {
  const { visibleProductIds } = useTradingTableTabsFilters();
  const isMobile = useIsMobile();

  return (
    <OpenOrdersTableTabContent
      productIds={visibleProductIds}
      isMobile={isMobile}
    />
  );
}
