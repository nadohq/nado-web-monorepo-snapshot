import { MobileTradingBottomNavigationTabs } from 'client/modules/trading/components/MobileTradingBottomNavigationTabs/MobileTradingBottomNavigationTabs';
import { TradingLayoutProps } from 'client/modules/trading/layout/types';

export function MobileTradingLayout({
  productId,
  marketSwitcherDefaultCategory,
  InfoCards,
  OrderPlacement,
}: TradingLayoutProps) {
  return (
    <MobileTradingBottomNavigationTabs
      productId={productId}
      OrderPlacement={OrderPlacement}
      marketSwitcherDefaultCategory={marketSwitcherDefaultCategory}
      InfoCards={InfoCards}
    />
  );
}
