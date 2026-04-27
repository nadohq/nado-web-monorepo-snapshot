import { useIsMobile } from '@nadohq/web-ui';
import { HistoricalTradesTableTabContent } from 'client/modules/tables/historicalTrades/HistoricalTradesTableTabContent';
import { TRADING_TABLE_TAB_PAGE_SIZE } from 'client/modules/trading/components/TradingTableTabs/consts';
import { useTradingTableTabsFilters } from 'client/modules/trading/components/TradingTableTabs/TradingTableTabsFilters/useTradingTableTabsFilters';

export function TradingHistoricalTradesTabContent() {
  const { visibleProductIds } = useTradingTableTabsFilters();
  const isMobile = useIsMobile();

  return (
    <HistoricalTradesTableTabContent
      pageSize={TRADING_TABLE_TAB_PAGE_SIZE}
      showPagination={false}
      productIds={visibleProductIds}
      isMobile={isMobile}
    />
  );
}
