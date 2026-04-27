import { MarketCategory } from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { AccountInfoCard } from 'client/modules/trading/components/AccountInfoCard';
import { FavoriteTickersBar } from 'client/modules/trading/components/FavoriteTickersBar/FavoriteTickersBar';
import { MarketDataTabs } from 'client/modules/trading/components/MarketDataTabs';
import { TradingMarketSwitcher } from 'client/modules/trading/components/TradingMarketSwitcher/TradingMarketSwitcher';
import { TradingPageCard } from 'client/modules/trading/components/TradingPageCard';
import { LargeScreenTradingTableTabs } from 'client/modules/trading/components/TradingTableTabs/LargeScreenTradingTableTabs';
import { useTradingConsolePosition } from 'client/modules/trading/hooks/useTradingConsolePosition';
import { TRADING_LAYOUT_GAP_CLASSNAME } from 'client/modules/trading/layout/consts';
import { TradingLayoutProps } from 'client/modules/trading/layout/types';
import { ReactNode } from 'react';

interface Props {
  productId: number | undefined;
  showMarketOrderSideBar?: boolean;
  heroComponent: ReactNode;
  marketSwitcherDefaultCategory: MarketCategory;
  InfoCards: TradingLayoutProps['InfoCards'];
  OrderPlacement: TradingLayoutProps['OrderPlacement'];
}

export function LargeScreenTradingLayout({
  productId,
  showMarketOrderSideBar,
  heroComponent,
  marketSwitcherDefaultCategory,
  InfoCards,
  OrderPlacement,
}: Props) {
  const { consolePosition } = useTradingConsolePosition();

  const flexDirectionByConsolePosition =
    consolePosition === 'left' ? 'flex-row' : 'flex-row-reverse';

  return (
    <div
      className={joinClassNames(
        'flex flex-col py-1',
        TRADING_LAYOUT_GAP_CLASSNAME,
      )}
    >
      {/*Top bar*/}
      <div
        className={joinClassNames(
          'flex flex-col',
          TRADING_LAYOUT_GAP_CLASSNAME,
        )}
      >
        <TradingPageCard>
          <FavoriteTickersBar activeProductId={productId} />
        </TradingPageCard>
        <div
          className={joinClassNames(
            'h-trading-top-bar flex',
            TRADING_LAYOUT_GAP_CLASSNAME,
          )}
        >
          <TradingPageCard className="w-trade-console">
            <TradingMarketSwitcher
              triggerClassName="w-full h-full"
              productId={productId}
              defaultMarketCategory={marketSwitcherDefaultCategory}
            />
          </TradingPageCard>
          <TradingPageCard
            // `overflow-hidden` to allow scrolling when screen size shrinks instead of overflowing the page.
            className="flex-1 overflow-hidden"
          >
            <InfoCards className="h-full w-full" />
          </TradingPageCard>
        </div>
      </div>
      {/* Order placement, charts and table area */}
      <div
        className={joinClassNames(
          'flex',
          TRADING_LAYOUT_GAP_CLASSNAME,
          flexDirectionByConsolePosition,
        )}
      >
        {/* Order placement & Account info card */}
        <div
          className={joinClassNames(
            'w-trade-console flex flex-col',
            TRADING_LAYOUT_GAP_CLASSNAME,
          )}
        >
          {/* Set min-h to be equal to the (orderbook, chart) sections. */}
          <TradingPageCard className="flex min-h-[max(580px,65vh)]">
            <OrderPlacement className="flex-1" />
          </TradingPageCard>
          <AccountInfoCard className="flex-1" productId={productId} />
        </div>
        <div
          className={joinClassNames(
            'flex flex-1 flex-col',
            TRADING_LAYOUT_GAP_CLASSNAME,
            'overflow-hidden',
          )}
        >
          <div
            className={joinClassNames(
              'flex',
              TRADING_LAYOUT_GAP_CLASSNAME,
              // Use height that is at least 580px or 65vh. Which ever is larger is used to prevent the elements from being too small on large screens and fit smaller screens.
              'h-[max(580px,65vh)]',
              flexDirectionByConsolePosition,
            )}
          >
            {/* Orderbook/Latest Trades */}
            {showMarketOrderSideBar && (
              <TradingPageCard
                // 'overflow-hidden' to prevent unrounded corners (ex. OrderbookPriceBox) from escaping the card
                className="w-market-orders overflow-hidden"
              >
                <MarketDataTabs className="h-full" productId={productId} />
              </TradingPageCard>
            )}
            {/*Chart area*/}
            <TradingPageCard
              // 'overflow-hidden' to prevent the unrounded corners from escaping the card
              className="flex-1 overflow-hidden"
            >
              {heroComponent}
            </TradingPageCard>
          </div>
          {/* Table */}
          <TradingPageCard
            // `overflow-hidden` prevents the component from extending itself off-screen on certain tables
            className="flex-1 overflow-hidden"
          >
            <LargeScreenTradingTableTabs productId={productId} />
          </TradingPageCard>
        </div>
      </div>
    </div>
  );
}
