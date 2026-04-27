'use client';

import { TradingChartTabs } from 'client/modules/trading/chart/TradingChartTabs';
import { useTradingPageHead } from 'client/modules/trading/hooks/useTradingPageHead';
import { TradingPageLayout } from 'client/modules/trading/layout/TradingPageLayout';
import { useTradingWebSocketSubscriptions } from 'client/modules/trading/webSockets/useTradingWebSocketSubscriptions';
import { SpotMarketInfoCards } from 'client/pages/SpotTrading/components/SpotMarketInfoCards';
import { SpotOrderPlacementSection } from 'client/pages/SpotTrading/components/SpotOrderPlacementSection/SpotOrderPlacementSection';
import {
  SpotOrderFormContextProvider,
  useSpotOrderFormContext,
} from 'client/pages/SpotTrading/context/SpotOrderFormContext';

/**
 * Contains all of the content + logic for the spot trading page.
 * This needs to be extracted as we need access to `SpotOrderFormContext`
 */
function SpotTradingPageContent() {
  const { currentMarket } = useSpotOrderFormContext();

  useTradingWebSocketSubscriptions(currentMarket?.productId);
  useTradingPageHead({ productId: currentMarket?.productId });

  return (
    <TradingPageLayout
      productId={currentMarket?.productId}
      marketSwitcherDefaultCategory="spot"
      InfoCards={SpotMarketInfoCards}
      OrderPlacement={SpotOrderPlacementSection}
      ChartComponent={TradingChartTabs}
    />
  );
}

export function SpotTradingPage() {
  return (
    <SpotOrderFormContextProvider>
      <SpotTradingPageContent />
    </SpotOrderFormContextProvider>
  );
}
