import { MarketCategory } from '@nadohq/react-client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { Divider, Icons, TextButton } from '@nadohq/web-ui';
import { FavoriteTickersBar } from 'client/modules/trading/components/FavoriteTickersBar/FavoriteTickersBar';
import { MarketDataTabs } from 'client/modules/trading/components/MarketDataTabs';
import { TradingMarketSwitcher } from 'client/modules/trading/components/TradingMarketSwitcher/TradingMarketSwitcher';
import { TradingPageCard } from 'client/modules/trading/components/TradingPageCard';
import { MobileTradingTableTabs } from 'client/modules/trading/components/TradingTableTabs/MobileTradingTableTabs';
import { MOBILE_TRADING_MARKET_DATA_TABS_HEIGHT } from 'client/modules/trading/layout/consts';
import { MobileOrderbook } from 'client/modules/trading/marketOrders/orderbook/MobileOrderbook';
import { ElementType, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  productId: number | undefined;
  marketSwitcherDefaultCategory: MarketCategory;
  InfoCards: ElementType<WithClassnames>;
  OrderPlacement: ElementType<WithClassnames>;
}

export function MobileTradingTradeTabContent({
  productId,
  marketSwitcherDefaultCategory,
  InfoCards,
  OrderPlacement,
}: Props) {
  const { t } = useTranslation();

  const [isChartVisible, setIsChartVisible] = useState(false);

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
      <TradingPageCard className="flex flex-col">
        <TextButton
          colorVariant="primary"
          className="p-2 text-xs"
          startIcon={<Icons.ChartLine size={16} />}
          onClick={() => setIsChartVisible(!isChartVisible)}
        >
          {isChartVisible ? t(($) => $.hideChart) : t(($) => $.showChart)}
        </TextButton>
        {isChartVisible && <Divider />}
        <MarketDataTabs
          className={joinClassNames(
            MOBILE_TRADING_MARKET_DATA_TABS_HEIGHT,
            // Hide chart when it is not visible
            !isChartVisible && 'hidden',
          )}
          productId={productId}
          withChartTabs
        />
      </TradingPageCard>
      <TradingPageCard className="divide-overlay-divider flex divide-x">
        <MobileOrderbook className="w-30" productId={productId} depth={7} />
        <OrderPlacement className="flex-1" />
      </TradingPageCard>
      <TradingPageCard>
        <MobileTradingTableTabs productId={productId} />
      </TradingPageCard>
    </>
  );
}
