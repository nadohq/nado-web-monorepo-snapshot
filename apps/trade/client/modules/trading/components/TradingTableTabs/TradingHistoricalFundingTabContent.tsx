import { useIsMobile } from '@nadohq/web-ui';
import { HistoricalFundingTableTabContent } from 'client/modules/tables/historicalFunding/HistoricalFundingTableTabContent';
import { TRADING_TABLE_TAB_PAGE_SIZE } from 'client/modules/trading/components/TradingTableTabs/consts';
import { useTradingTableTabsFilters } from 'client/modules/trading/components/TradingTableTabs/TradingTableTabsFilters/useTradingTableTabsFilters';

export function TradingHistoricalFundingTabContent() {
  const { visibleProductIds } = useTradingTableTabsFilters();
  const isMobile = useIsMobile();

  return (
    <HistoricalFundingTableTabContent
      pageSize={TRADING_TABLE_TAB_PAGE_SIZE}
      showPagination={false}
      productIds={visibleProductIds}
      isMobile={isMobile}
    />
  );
}
