import { MarketDataTabs } from 'client/modules/trading/components/MarketDataTabs';
import { LargeScreenTradingLayout } from 'client/modules/trading/layout/LargeScreenTradingLayout';
import { TradingLayoutProps } from 'client/modules/trading/layout/types';

export function TabletTradingLayout({
  productId,
  marketSwitcherDefaultCategory,
  InfoCards,
  OrderPlacement,
}: TradingLayoutProps) {
  return (
    <LargeScreenTradingLayout
      heroComponent={
        <MarketDataTabs
          className="h-full"
          productId={productId}
          withChartTabs
        />
      }
      productId={productId}
      marketSwitcherDefaultCategory={marketSwitcherDefaultCategory}
      InfoCards={InfoCards}
      OrderPlacement={OrderPlacement}
    />
  );
}
