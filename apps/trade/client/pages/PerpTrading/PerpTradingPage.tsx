'use client';

import { TradingChartTabs } from 'client/modules/trading/chart/TradingChartTabs';
import { useTradingPageHead } from 'client/modules/trading/hooks/useTradingPageHead';
import { TradingPageLayout } from 'client/modules/trading/layout/TradingPageLayout';
import { useTradingWebSocketSubscriptions } from 'client/modules/trading/webSockets/useTradingWebSocketSubscriptions';
import { PerpMarketInfoCards } from 'client/pages/PerpTrading/components/PerpMarketInfoCards';
import { PerpOrderPlacementSection } from 'client/pages/PerpTrading/components/PerpOrderPlacementSection/PerpOrderPlacementSection';
import {
  PerpOrderFormContextProvider,
  usePerpOrderFormContext,
} from 'client/pages/PerpTrading/context/PerpOrderFormContext';

/**
 * Contains all of the content + logic for the perp trading page.
 * This needs to be extracted as we need access to `PerpOrderFormContext`
 */
function PerpTradingPageContent() {
  const { currentMarket } = usePerpOrderFormContext();

  useTradingWebSocketSubscriptions(currentMarket?.productId);
  useTradingPageHead({ productId: currentMarket?.productId });

  return (
    <TradingPageLayout
      productId={currentMarket?.productId}
      marketSwitcherDefaultCategory="perp"
      InfoCards={PerpMarketInfoCards}
      OrderPlacement={PerpOrderPlacementSection}
      ChartComponent={TradingChartTabs}
    />
  );
}

export function PerpTradingPage() {
  return (
    <PerpOrderFormContextProvider>
      <PerpTradingPageContent />
    </PerpOrderFormContextProvider>
  );
}
