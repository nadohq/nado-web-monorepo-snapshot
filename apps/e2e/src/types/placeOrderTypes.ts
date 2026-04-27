/**
 * Type of orders that can be placed on the engine.
 * (Order types and constants originate from the trade app)
 */
export type EnginePlaceOrderType = 'market' | 'limit' | 'multi_limit';
// This is typed as string[] so that `.includes()` checks work correctly
export const ENGINE_PLACE_ORDER_TYPES: string[] = [
  'market',
  'limit',
  'multi_limit',
] satisfies EnginePlaceOrderType[];

export type PriceTriggerPlaceOrderType = 'stop_market' | 'stop_limit';
export const PRICE_TRIGGER_PLACE_ORDER_TYPES: string[] = [
  'stop_market',
  'stop_limit',
] satisfies PriceTriggerPlaceOrderType[];

export type TimeTriggerPlaceOrderType = 'twap';
export const TIME_TRIGGER_PLACE_ORDER_TYPES: string[] = [
  'twap',
] satisfies TimeTriggerPlaceOrderType[];

/**
 * Type of orders that can be placed on the trigger service.
 */
export type TriggerPlaceOrderType =
  | PriceTriggerPlaceOrderType
  | TimeTriggerPlaceOrderType;
// Cannot use `satisfies` here because the individual order type arrays are typed as string
export const TRIGGER_PLACE_ORDER_TYPES: string[] = [
  ...PRICE_TRIGGER_PLACE_ORDER_TYPES,
  ...TIME_TRIGGER_PLACE_ORDER_TYPES,
];

export type PlaceOrderType = EnginePlaceOrderType | TriggerPlaceOrderType;
