/** Available trigger price types for TP/SL orders. */
export const TRIGGER_REFERENCE_PRICE_TYPES = [
  'last_price',
  'oracle_price',
  'mid_price',
] as const;
export type TriggerReferencePriceType =
  (typeof TRIGGER_REFERENCE_PRICE_TYPES)[number];
