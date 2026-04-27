import { LargeScreenTradingLayout } from 'client/modules/trading/layout/LargeScreenTradingLayout';
import { TradingLayoutProps } from 'client/modules/trading/layout/types';

export function DesktopTradingLayout({
  productId,
  marketSwitcherDefaultCategory,
  InfoCards,
  OrderPlacement,
  ChartComponent,
}: TradingLayoutProps) {
  return (
    <LargeScreenTradingLayout
      showMarketOrderSideBar
      heroComponent={
        <ChartComponent productId={productId} className="h-full" />
      }
      productId={productId}
      marketSwitcherDefaultCategory={marketSwitcherDefaultCategory}
      InfoCards={InfoCards}
      OrderPlacement={OrderPlacement}
    />
  );
}
