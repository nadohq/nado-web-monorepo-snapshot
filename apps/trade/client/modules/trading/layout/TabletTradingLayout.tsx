import { MarketDataTabs } from 'client/modules/trading/components/MarketDataTabs';
import { TabletGridTradingLayout } from 'client/modules/trading/layout/TabletGridTradingLayout';
import { TradingLayoutProps } from 'client/modules/trading/layout/types';

export function TabletTradingLayout({
  productId,
  InfoCards,
  OrderPlacement,
}: TradingLayoutProps) {
  return (
    <TabletGridTradingLayout
      heroComponent={
        <MarketDataTabs
          className="h-full"
          productId={productId}
          withChartTabs
        />
      }
      productId={productId}
      InfoCards={InfoCards}
      OrderPlacement={OrderPlacement}
    />
  );
}
