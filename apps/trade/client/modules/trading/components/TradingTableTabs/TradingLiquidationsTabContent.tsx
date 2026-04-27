import { useIsMobile } from '@nadohq/web-ui';
import { LiquidationEventsTableTabContent } from 'client/modules/tables/liquidations/LiquidationEventsTableTabContent';
import { TRADING_TABLE_TAB_PAGE_SIZE } from 'client/modules/trading/components/TradingTableTabs/consts';
import { useTradingTableTabsFilters } from 'client/modules/trading/components/TradingTableTabs/TradingTableTabsFilters/useTradingTableTabsFilters';

/**
 * Renders the liquidations tab content in the trading interface.
 * Filters liquidation events by visible products and adapts to mobile/desktop views.
 */
export function TradingLiquidationsTabContent() {
  const { visibleProductIds } = useTradingTableTabsFilters();
  const isMobile = useIsMobile();

  return (
    <LiquidationEventsTableTabContent
      pageSize={TRADING_TABLE_TAB_PAGE_SIZE}
      showPagination={false}
      isMobile={isMobile}
      productIds={visibleProductIds}
    />
  );
}
