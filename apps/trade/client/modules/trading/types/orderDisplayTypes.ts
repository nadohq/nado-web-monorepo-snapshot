import {
  EnginePlaceOrderType,
  PriceTriggerPlaceOrderType,
  TimeTriggerPlaceOrderType,
} from 'client/modules/trading/types/placeOrderTypes';

export type EngineOrderDisplayType = Exclude<
  EnginePlaceOrderType,
  'multi_limit'
>;

export type PriceTriggerReduceOnlyOrderDisplayType =
  | 'take_profit'
  | 'stop_loss';

export type PriceTriggerOrderDisplayType =
  | PriceTriggerPlaceOrderType
  | PriceTriggerReduceOnlyOrderDisplayType;
export type TimeTriggerOrderDisplayType = TimeTriggerPlaceOrderType;

export type TriggerOrderDisplayType =
  | PriceTriggerOrderDisplayType
  | TimeTriggerOrderDisplayType;

export type OrderDisplayType = TriggerOrderDisplayType | EngineOrderDisplayType;
