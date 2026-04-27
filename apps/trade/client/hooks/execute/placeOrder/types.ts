import {
  BigNumberish,
  PriceTriggerCriteria,
  TimeTriggerCriteria,
} from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { TimeInForceType } from 'client/modules/trading/types/orderFormTypes';
import { PlaceOrderType } from 'client/modules/trading/types/placeOrderTypes';

export interface ExecutePlaceOrderIsolatedParams {
  borrowMargin: boolean;
  margin: BigNumberish;
}

export interface ExecutePlaceOrderCommonParams {
  productId: number;
  /** Price for the order itself, not the stop price (for trigger orders) */
  price: BigNumberish;
  amount: BigNumberish;
  /** For spot markets, this determines whether an affected spot balance can become negative */
  spotLeverage?: boolean;
  /** If undefined, 'default' will be used as order expiration type. */
  timeInForceType?: TimeInForceType;
  /** Used when timeInForceType is good_until and it's a limit order. */
  timeInForceInDays?: BigNumber;
  /** Used when timeInForceType is good_until or gtc and it's a limit order. */
  postOnly?: boolean;
  /** Used only for market orders */
  reduceOnly?: boolean;
  /**
   * Used for isolated orders
   */
  iso?: ExecutePlaceOrderIsolatedParams;
}

export interface ExecutePlaceEngineOrderParams extends ExecutePlaceOrderCommonParams {
  orderType: Extract<PlaceOrderType, 'market' | 'limit'>;
}

export interface ExecutePlacePriceTriggerOrderParams extends ExecutePlaceOrderCommonParams {
  orderType: Extract<PlaceOrderType, 'stop_market' | 'stop_limit'>;
  priceTriggerCriteria: PriceTriggerCriteria;
}

export interface ExecutePlaceTimeTriggerOrderParams extends ExecutePlaceOrderCommonParams {
  orderType: Extract<PlaceOrderType, 'twap'>;
  triggerCriteria: TimeTriggerCriteria;
  /** Slippage fraction for the TWAP orders. */
  slippageFraction: number;
  /** Number of TWAP orders to be placed. */
  numberOfOrders: number;
}

interface MultiLimitIndividualOrderParams {
  /** If not provided, the productId from the common params will be used. */
  productId?: number;
  price: BigNumberish;
  amount: BigNumberish;
  /**
   * Used for isolated orders
   */
  iso?: ExecutePlaceOrderIsolatedParams;
}

export interface ExecuteMultiLimitOrderParams extends ExecutePlaceOrderCommonParams {
  orderType: Extract<PlaceOrderType, 'multi_limit'>;
  orders: MultiLimitIndividualOrderParams[];
}

export type ExecutePlaceOrderParams =
  | ExecutePlaceEngineOrderParams
  | ExecutePlacePriceTriggerOrderParams
  | ExecutePlaceTimeTriggerOrderParams
  | ExecuteMultiLimitOrderParams;
