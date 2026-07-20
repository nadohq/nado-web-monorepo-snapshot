import { BalanceSide } from '@nadohq/client';

import type {
  DesktopTradingGridItemId,
  TabletTradingGridItemId,
  TradingGridItemPositionAndSize,
} from 'client/modules/trading/layout/consts';
import { OrderbookPriceTickSpacingMultiplier } from 'client/modules/trading/marketOrders/orderbook/types';
import { GainOrLossInputType } from 'client/modules/trading/types/GainOrLossInputType';
import { OrderFormSizeDenom } from 'client/modules/trading/types/orderFormTypes';
import { EnginePlaceOrderType } from 'client/modules/trading/types/placeOrderTypes';
import { TriggerReferencePriceType } from 'client/modules/trading/types/TriggerReferencePriceType';

/**
 * Shared constant for left/right positioning options
 */
const LEFT_RIGHT_POSITIONS = ['left', 'right'] as const;

export const NOTIFICATION_POSITIONS = LEFT_RIGHT_POSITIONS;

export type NotificationPosition = (typeof NOTIFICATION_POSITIONS)[number];

/**
 * Legacy cross-margin leverage selection
 */
export type LeverageByProductId = Record<number, number>;

/**
 * New margin modes that combines cross & isolated margin
 */
export const MARGIN_MODES_TYPES = ['isolated', 'cross'] as const;

export type MarginModeType = (typeof MARGIN_MODES_TYPES)[number];

export interface IsoMarginMode {
  mode: 'isolated';
  leverage: number;
  enableBorrows: boolean;
}

export interface CrossMarginMode {
  mode: 'cross';
  leverage: number;
  enableBorrows?: never;
}

export type MarginMode = IsoMarginMode | CrossMarginMode;

export type MarginModeByProductId = Record<number, MarginMode>;

export interface MarginModeSettings {
  default: MarginModeType;
  lastSelected: MarginModeByProductId;
}

export type OrderbookTickSpacingMultiplierByProductId = Record<
  number,
  OrderbookPriceTickSpacingMultiplier
>;

export interface OrderSlippageSettings {
  market: number;
  stopMarket: number;
  takeProfit: number;
  stopLoss: number;
}

export type OrderSlippageType = keyof OrderSlippageSettings;

export interface TradingTableTabFilters {
  showAllMarkets: boolean;
  hideSmallBalances: boolean;
}

export type TradingTableTabFilterId = keyof TradingTableTabFilters;

export const LAST_SELECTED_ENGINE_ORDER_TYPES = [
  'market',
  'limit',
] as const satisfies EnginePlaceOrderType[];
export type LastSelectedEngineOrderType =
  (typeof LAST_SELECTED_ENGINE_ORDER_TYPES)[number];

export const BALANCE_SIDES = ['long', 'short'] as const satisfies BalanceSide[];

/**
 * User preference for trigger price types when creating TP/SL orders.
 * These settings persist in localStorage and auto-apply to new orders.
 */
export interface TpSlTriggerPriceTypeSettings {
  takeProfit: TriggerReferencePriceType;
  stopLoss: TriggerReferencePriceType;
}

/**
 * User preference for the gain/loss input display type when creating TP/SL
 * orders. These settings persist in localStorage and auto-apply to new orders.
 */
export interface TpSlGainOrLossInputTypeSettings {
  takeProfit: GainOrLossInputType;
  stopLoss: GainOrLossInputType;
}

/** Persisted user-owned trading grid position and size. */
export type SavedGridLayoutItem = TradingGridItemPositionAndSize;

export interface SavedTradingUserSettings {
  favoriteMarketIds: number[];
  leverageByProductId: LeverageByProductId;
  marginMode: MarginModeSettings;
  orderbookTickSpacingMultiplierByProductId: OrderbookTickSpacingMultiplierByProductId;
  showOrderbookTotalInQuote: boolean;
  spotLeverageEnabled: boolean;
  slippage: OrderSlippageSettings;
  tpSlTriggerPriceType: TpSlTriggerPriceTypeSettings;
  tpSlGainOrLossInputType: TpSlGainOrLossInputTypeSettings;
  enableTradingNotifications: boolean;
  enableTradingOrderLines: boolean;
  enableTradingPositionLines: boolean;
  enableTradingOrderbookAnimations: boolean;
  enableChartMarks: boolean;
  enableQuickMarketClose: boolean;
  enableClassicDepositUi: boolean;
  /**
   * Admin-tools override that allows market makers to trade isolated-only
   * markets (e.g. RWAs) in cross margin mode by ignoring the `isolatedOnly`
   * market restriction in the UI.
   */
  enableCrossMarginForIsoOnlyMarkets: boolean;
  tradingTableTabFilters: TradingTableTabFilters;
  lastSelectedSpotMarketId: number | undefined;
  lastSelectedPerpMarketId: number | undefined;
  lastSelectedEngineOrderType: LastSelectedEngineOrderType;
  lastSelectedSizeDenom: OrderFormSizeDenom;
  lastSelectedSide: BalanceSide;
  gridLayout: {
    desktop: Record<DesktopTradingGridItemId, SavedGridLayoutItem>;
    tablet: Record<TabletTradingGridItemId, SavedGridLayoutItem>;
  };
}
