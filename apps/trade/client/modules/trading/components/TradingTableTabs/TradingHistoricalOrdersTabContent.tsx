import { useIsMobile } from '@nadohq/web-ui';
import { HistoricalOrdersTableTabContent } from 'client/modules/tables/historicalOrders/HistoricalOrdersTableTabContent';
import { TRADING_TABLE_TAB_PAGE_SIZE } from 'client/modules/trading/components/TradingTableTabs/consts';
import { useTradingTableTabsFilters } from 'client/modules/trading/components/TradingTableTabs/TradingTableTabsFilters/useTradingTableTabsFilters';

export function TradingHistoricalOrdersTabContent() {
  const { visibleProductIds } = useTradingTableTabsFilters();
  const isMobile = useIsMobile();

  return (
    <HistoricalOrdersTableTabContent
      pageSize={TRADING_TABLE_TAB_PAGE_SIZE}
      showPagination={false}
      productIds={visibleProductIds}
      isMobile={isMobile}
    />
  );
}
