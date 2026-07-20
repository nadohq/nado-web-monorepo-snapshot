import type { LayoutItem } from 'react-grid-layout';

/** Layout gap applied across trading layouts. */
export const TRADING_LAYOUT_GAP_CLASSNAME = 'gap-1';

/** Roughly accounts for the size of the orderbook. */
export const MOBILE_TRADING_MARKET_DATA_TABS_HEIGHT = 'h-95';

/** Drag handle className applied to `ReactGridTradingPageCard` for tablet. */
export const TABLET_TRADING_GRID_DRAG_HANDLE_CLASSNAME = 'h-3';

export type TradingGridItemPositionAndSize = Pick<
  LayoutItem,
  'x' | 'y' | 'w' | 'h'
>;

/** App-owned trading grid item position, size, and resize constraints. */
export interface TradingGridItemConfig extends TradingGridItemPositionAndSize {
  minW: number;
  minH: number;
}

/** Default desktop grid item constraints/positions for react-grid-layout. */
export const DESKTOP_TRADING_GRID_ITEM_CONFIG = {
  chart: { x: 0, y: 0, w: 15, h: 25, minW: 4, minH: 7 },
  'market-data': { x: 15, y: 0, w: 4, h: 25, minW: 2, minH: 7 },
  'order-placement': { x: 19, y: 0, w: 5, h: 25, minW: 3, minH: 15 },
  'trading-table': { x: 0, y: 25, w: 19, h: 18, minW: 4, minH: 4 },
  'account-info': { x: 19, y: 25, w: 5, h: 18, minW: 3, minH: 2 },
} satisfies Record<string, TradingGridItemConfig>;

/** Desktop trading grid item ids used by react-grid-layout. */
export type DesktopTradingGridItemId =
  keyof typeof DESKTOP_TRADING_GRID_ITEM_CONFIG;

/**
 * Desktop trading grid item ids, in stable order, for Zod enums and runtime checks.
 * DesktopTradingGridItemId[] can be empty; z.enum requires a non-empty tuple, so the spread cast provides that guarantee.
 */
export const DESKTOP_TRADING_GRID_ITEM_IDS = Object.keys(
  DESKTOP_TRADING_GRID_ITEM_CONFIG,
) as [DesktopTradingGridItemId, ...DesktopTradingGridItemId[]];

function getDefaultSavedGridLayout<TItemId extends string>(
  config: Record<TItemId, TradingGridItemConfig>,
): Record<TItemId, TradingGridItemPositionAndSize> {
  return Object.fromEntries(
    (Object.entries(config) as [TItemId, TradingGridItemConfig][]).map(
      ([id, { x, y, w, h }]) => [id, { x, y, w, h }],
    ),
  ) as Record<TItemId, TradingGridItemPositionAndSize>;
}

/** Default desktop saved grid layout (x/y/w/h only). */
export const DEFAULT_DESKTOP_TRADING_GRID_LAYOUT = getDefaultSavedGridLayout(
  DESKTOP_TRADING_GRID_ITEM_CONFIG,
);

/** Default tablet grid item constraints/positions for react-grid-layout. */
export const TABLET_TRADING_GRID_ITEM_CONFIG = {
  chart: { x: 0, y: 0, w: 17, h: 25, minW: 4, minH: 7 },
  'order-placement': { x: 17, y: 0, w: 7, h: 25, minW: 3, minH: 15 },
  'trading-table': { x: 0, y: 25, w: 17, h: 18, minW: 4, minH: 4 },
  'account-info': { x: 17, y: 25, w: 7, h: 18, minW: 3, minH: 2 },
} satisfies Record<string, TradingGridItemConfig>;

/** Tablet trading grid item ids used by react-grid-layout. */
export type TabletTradingGridItemId =
  keyof typeof TABLET_TRADING_GRID_ITEM_CONFIG;

/**
 * Tablet trading grid item ids, in stable order, for Zod enums and runtime checks.
 * TabletTradingGridItemId[] can be empty; z.enum requires a non-empty tuple, so the spread cast provides that guarantee.
 */
export const TABLET_TRADING_GRID_ITEM_IDS = Object.keys(
  TABLET_TRADING_GRID_ITEM_CONFIG,
) as [TabletTradingGridItemId, ...TabletTradingGridItemId[]];

/** Default tablet saved grid layout (x/y/w/h only). */
export const DEFAULT_TABLET_TRADING_GRID_LAYOUT = getDefaultSavedGridLayout(
  TABLET_TRADING_GRID_ITEM_CONFIG,
);
