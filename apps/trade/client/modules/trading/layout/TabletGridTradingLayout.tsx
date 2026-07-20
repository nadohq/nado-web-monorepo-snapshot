import { joinClassNames } from '@nadohq/web-common';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { AccountInfoCard } from 'client/modules/trading/components/AccountInfoCard/AccountInfoCard';
import { FavoriteTickersBar } from 'client/modules/trading/components/FavoriteTickersBar/FavoriteTickersBar';
import { ReactGridTradingPageCard } from 'client/modules/trading/components/ReactGridTradingPageCard';
import { TradingMarketSwitcher } from 'client/modules/trading/components/TradingMarketSwitcher/TradingMarketSwitcher';
import { TradingPageCard } from 'client/modules/trading/components/TradingPageCard';
import { TradingPageNewMarketBanner } from 'client/modules/trading/components/TradingPageNewMarketBanner/TradingPageNewMarketBanner';
import { LargeScreenTradingTableTabs } from 'client/modules/trading/components/TradingTableTabs/LargeScreenTradingTableTabs';
import type { TabletTradingGridItemId } from 'client/modules/trading/layout/consts';
import {
  TABLET_TRADING_GRID_DRAG_HANDLE_CLASSNAME,
  TRADING_LAYOUT_GAP_CLASSNAME,
} from 'client/modules/trading/layout/consts';
import { useTabletTradingGridLayout } from 'client/modules/trading/layout/hooks/useTabletTradingGridLayout';
import { TradingGridLayoutContainer } from 'client/modules/trading/layout/TradingGridLayoutContainer';
import { TradingLayoutProps } from 'client/modules/trading/layout/types';
import { ReactNode } from 'react';

/** Props for the tablet grid trading layout, replacing ChartComponent with a pre-rendered heroComponent. */
interface Props extends Omit<TradingLayoutProps, 'ChartComponent'> {
  /** Pre-rendered hero component (chart with tabs) to display in the chart grid item. */
  heroComponent: ReactNode;
}

/** Tablet trading layout with drag-and-resize support via react-grid-layout. */
export function TabletGridTradingLayout({
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
  } = useTabletTradingGridLayout();

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
        {/* RGL matches `key` to the layout `i` field and injects style/event props onto direct children. */}
        <ReactGridTradingPageCard
          key={'chart' satisfies TabletTradingGridItemId}
          dragHandleClassName={TABLET_TRADING_GRID_DRAG_HANDLE_CLASSNAME}
        >
          {heroComponent}
        </ReactGridTradingPageCard>
        <ReactGridTradingPageCard
          key={'order-placement' satisfies TabletTradingGridItemId}
          dragHandleClassName={TABLET_TRADING_GRID_DRAG_HANDLE_CLASSNAME}
        >
          <OrderPlacement className="h-full" />
        </ReactGridTradingPageCard>
        <ReactGridTradingPageCard
          key={'trading-table' satisfies TabletTradingGridItemId}
          dragHandleClassName={TABLET_TRADING_GRID_DRAG_HANDLE_CLASSNAME}
        >
          <LargeScreenTradingTableTabs
            className="h-full"
            productId={productId}
          />
        </ReactGridTradingPageCard>
        <ReactGridTradingPageCard
          key={'account-info' satisfies TabletTradingGridItemId}
          dragHandleClassName={TABLET_TRADING_GRID_DRAG_HANDLE_CLASSNAME}
        >
          <AccountInfoCard productId={productId} />
        </ReactGridTradingPageCard>
      </TradingGridLayoutContainer>
    </div>
  );
}
