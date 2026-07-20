import { DesktopGridTradingLayout } from 'client/modules/trading/layout/DesktopGridTradingLayout';
import { TradingLayoutProps } from 'client/modules/trading/layout/types';

export function DesktopTradingLayout({
  productId,
  InfoCards,
  OrderPlacement,
  ChartComponent,
}: TradingLayoutProps) {
  return (
    <DesktopGridTradingLayout
      heroComponent={
        <ChartComponent productId={productId} className="h-full" />
      }
      productId={productId}
      InfoCards={InfoCards}
      OrderPlacement={OrderPlacement}
    />
  );
}
