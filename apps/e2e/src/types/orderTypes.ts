import { Expected, MarginMode } from 'src/types/commonTypes';

/**
 * Direction labels differ by market type:
 * - Perp orders display 'long' / 'short'
 * - Spot orders display 'buy' / 'sell'
 */
export type SpotDirection = 'buy' | 'sell';
export type PerpDirection = 'long' | 'short';
export type OrderDirection = SpotDirection | PerpDirection;

// Base type for all open orders (market info from left panel)
interface BaseOpenOrder {
  market: string;
  marginMode: MarginMode;
}

// Limit Orders tab columns: Order Type, Direction, Order Price, Filled/Total, Order Value, Reduce Only, Time
export interface LimitOrder extends BaseOpenOrder {
  orderType: string;
  direction: OrderDirection;
  orderPrice: string;
  filledTotal: string;
  orderValue: string;
  reduceOnly: string;
  date: string;
}

// Stop Orders tab columns: Order Type, Direction, Order Price, Amount, Order Value, Trigger Condition, Reduce Only, Time
export interface StopOrder extends BaseOpenOrder {
  orderType: string;
  direction: OrderDirection;
  orderPrice: string;
  amount: string;
  orderValue: string;
  triggerCondition: string;
  reduceOnly: string;
  date: string;
}

// TP/SL tab columns: Order Type, Direction, Order Price, Amount, Order Value, Trigger Condition, Reduce Only, Time
export interface TpSlOrder extends BaseOpenOrder {
  orderType: string;
  direction: OrderDirection;
  orderPrice: string;
  amount: string;
  orderValue: string;
  triggerCondition: string;
  reduceOnly: string;
  date: string;
}

// TWAP tab columns: Order Type, Direction, Order Price, Filled/Total, Order Value, Reduce Only, Time
export interface TwapOrder extends BaseOpenOrder {
  orderType: string;
  direction: OrderDirection;
  orderPrice: string;
  filledTotal: string;
  orderValue: string;
  reduceOnly: string;
  date: string;
}

// Union type for backward compatibility
export interface OpenOrder
  extends LimitOrder, StopOrder, TpSlOrder, TwapOrder {}

// Order types for conditional orders (TP/SL)
export enum OrderType {
  Limit = 'Limit',
  Market = 'Market',
  StopLimit = 'Stop Limit',
  StopMarket = 'Stop Market',
  TakeProfit = 'Take Profit',
  StopLoss = 'Stop Loss',
}

export enum OpenOrdersType {
  LimitOrders = 'engine_orders',
  StopOrders = 'stop_orders',
  TpSl = 'tp_sl',
  Twap = 'twap',
}

/** Expected data structure for TP/SL and other conditional order assertions */
export type ExpectedConditionalOrder = Expected<TpSlOrder>;
