import { BigNumber } from 'bignumber.js';

export interface ModifyOrderParams {
  productId: number;
  digest: string;
  /** Whether this is a price-triggered order (stop market, stop limit, TP/SL) */
  isPriceTrigger: boolean;
  /** New limit/order price. For trigger orders, this is the limit price (ignored for market triggers) */
  newPrice?: BigNumber;
  /** New order amount */
  newAmount?: BigNumber;
  /** New trigger price (only for trigger orders) */
  newTriggerPrice?: BigNumber;
}

export interface ModifyOrderResult {
  digest: string;
}
