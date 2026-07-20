import { joinClassNames } from '@nadohq/web-common';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { AccountInfoCard } from 'client/modules/trading/components/AccountInfoCard/AccountInfoCard';
import { FavoriteTickersBar } from 'client/modules/trading/components/FavoriteTickersBar/FavoriteTickersBar';
import { MarketDataTabs } from 'client/modules/trading/components/MarketDataTabs';
import { ReactGridTradingPageCard } from 'client/modules/trading/components/ReactGridTradingPageCard';
import { TradingMarketSwitcher } from 'client/modules/trading/components/TradingMarketSwitcher/TradingMarketSwitcher';
import { TradingPageCard } from 'client/modules/trading/components/TradingPageCard';
import { TradingPageNewMarketBanner } from 'client/modules/trading/components/TradingPageNewMarketBanner/TradingPageNewMarketBanner';
import { LargeScreenTradingTableTabs } from 'client/modules/trading/components/TradingTableTabs/LargeScreenTradingTableTabs';
import type { DesktopTradingGridItemId } from 'client/modules/trading/layout/consts';
import { TRADING_LAYOUT_GAP_CLASSNAME } from 'client/modules/trading/layout/consts';
import { useDesktopTradingGridLayout } from 'client/modules/trading/layout/hooks/useDesktopTradingGridLayout';
import { TradingGridLayoutContainer } from 'client/modules/trading/layout/TradingGridLayoutContainer';
import { TradingLayoutProps } from 'client/modules/trading/layout/types';
import { ReactNode } from 'react';

/** Props for the desktop grid trading layout, replacing ChartComponent with a pre-rendered heroComponent. */
interface Props extends Omit<TradingLayoutProps, 'ChartComponent'> {
  /** Pre-rendered chart component to display in the chart grid item. */
  heroComponent: ReactNode;
}

/** Desktop trading layout with drag-and-resize support via react-grid-layout. */
export function DesktopGridTradingLayout({
  productId,
  heroComponent,
  InfoCards,
  OrderPlacement,
}: Props) {
  const isConnected = useIsConnected();

  const {
    containerRef,
    mounted,
    width,
    rowHeight,
    layout,
    onDragStop,
    onResizeStop,
  } = useDesktopTradingGridLayout();

  return (
    <div
      className={joinClassNames(
        'flex flex-col py-1',
        TRADING_LAYOUT_GAP_CLASSNAME,
      )}
    >
      <TradingPageNewMarketBanner productId={productId} />
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
            />
          </TradingPageCard>
          <TradingPageCard className="flex-1 overflow-hidden">
            <InfoCards className="h-full w-full" />
          </TradingPageCard>
        </div>
      </div>

      <TradingGridLayoutContainer
        containerRef={containerRef}
        mounted={mounted}
        width={width}
        rowHeight={rowHeight}
        layout={layout}
        isEnabled={isConnected}
        onDragStop={onDragStop}
        onResizeStop={onResizeStop}
      >
        {/* RGL matches `key` to the layout `i` field and injects style/event props onto direct children.
            ReactGridTradingPageCard renders the wrapper div itself and accepts those injected props. */}
        <ReactGridTradingPageCard
          key={'chart' satisfies DesktopTradingGridItemId}
        >
          {heroComponent}
        </ReactGridTradingPageCard>
        <ReactGridTradingPageCard
          key={'market-data' satisfies DesktopTradingGridItemId}
        >
          <MarketDataTabs
            // 'overflow-hidden' prevents unrounded corners (e.g. OrderbookPriceBox) from escaping the card
            className="h-full overflow-hidden"
            productId={productId}
            enableOrderbookHoverDetails
          />
        </ReactGridTradingPageCard>
        <ReactGridTradingPageCard
          key={'order-placement' satisfies DesktopTradingGridItemId}
        >
          <OrderPlacement className="h-full" />
        </ReactGridTradingPageCard>
        <ReactGridTradingPageCard
          key={'trading-table' satisfies DesktopTradingGridItemId}
        >
          <LargeScreenTradingTableTabs
            className="h-full"
            productId={productId}
          />
        </ReactGridTradingPageCard>
        <ReactGridTradingPageCard
          key={'account-info' satisfies DesktopTradingGridItemId}
        >
          <AccountInfoCard productId={productId} />
        </ReactGridTradingPageCard>
      </TradingGridLayoutContainer>
    </div>
  );
}
