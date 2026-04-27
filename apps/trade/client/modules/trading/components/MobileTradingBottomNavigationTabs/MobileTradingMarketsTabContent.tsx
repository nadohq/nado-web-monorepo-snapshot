import { MarketCategory } from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { FavoriteTickersBar } from 'client/modules/trading/components/FavoriteTickersBar/FavoriteTickersBar';
import { MarketDataTabs } from 'client/modules/trading/components/MarketDataTabs';
import { TradingMarketSwitcher } from 'client/modules/trading/components/TradingMarketSwitcher/TradingMarketSwitcher';
import { TradingPageCard } from 'client/modules/trading/components/TradingPageCard';
import { MobileTradingTableTabs } from 'client/modules/trading/components/TradingTableTabs/MobileTradingTableTabs';
import { MOBILE_TRADING_MARKET_DATA_TABS_HEIGHT } from 'client/modules/trading/layout/consts';
import { ElementType } from 'react';

interface Props {
  productId: number | undefined;
  marketSwitcherDefaultCategory: MarketCategory;
  InfoCards: ElementType<WithClassnames>;
}

export function MobileTradingMarketsTabContent({
  productId,
  marketSwitcherDefaultCategory,
  InfoCards,
}: Props) {
  return (
    <>
      <TradingPageCard className="flex flex-col">
        <FavoriteTickersBar activeProductId={productId} />
        <TradingMarketSwitcher
          productId={productId}
          defaultMarketCategory={marketSwitcherDefaultCategory}
          triggerClassName="rounded-b-none border-y border-overlay-divider"
        />
        <InfoCards />
      </TradingPageCard>
      <TradingPageCard>
        <MarketDataTabs
          productId={productId}
          withChartTabs
          className={MOBILE_TRADING_MARKET_DATA_TABS_HEIGHT}
        />
      </TradingPageCard>
      <TradingPageCard>
        <MobileTradingTableTabs productId={productId} />
      </TradingPageCard>
    </>
  );
}
