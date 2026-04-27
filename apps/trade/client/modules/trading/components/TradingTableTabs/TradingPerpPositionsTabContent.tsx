import { useIsMobile } from '@nadohq/web-ui';
import { PerpPositionsTableTabContent } from 'client/modules/tables/perpPositions/PerpPositionsTableTabContent';
import { useTradingTableTabsFilters } from 'client/modules/trading/components/TradingTableTabs/TradingTableTabsFilters/useTradingTableTabsFilters';

export function TradingPerpPositionsTabContent() {
  const { visibleProductIds } = useTradingTableTabsFilters();
  const isMobile = useIsMobile();

  return (
    <PerpPositionsTableTabContent
      productIds={visibleProductIds}
      isMobile={isMobile}
    />
  );
}
