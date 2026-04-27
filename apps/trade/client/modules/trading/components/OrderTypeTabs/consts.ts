import { PlaceOrderType } from 'client/modules/trading/types/placeOrderTypes';

// Basic price types shown in tabs
export const BASIC_ORDER_TYPES: PlaceOrderType[] = ['market', 'limit'];

// Advanced price types shown in dropdown
export const ADVANCED_ORDER_TYPES: PlaceOrderType[] = [
  'stop_market',
  'stop_limit',
  'twap',
  'multi_limit',
];
