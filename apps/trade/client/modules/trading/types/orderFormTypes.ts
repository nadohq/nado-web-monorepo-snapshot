import { BalanceSide } from '@nadohq/client';
import { InputValidatorFn } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { PlaceOrderType } from 'client/modules/trading/types/placeOrderTypes';
import { FieldPathByValue } from 'react-hook-form';

export type RoundPriceFn = (price: BigNumber) => BigNumber;
export type RoundAmountFn = (amount: BigNumber) => BigNumber;
export type SetActiveFieldFn = (
  field: FieldPathByValue<OrderFormValues, string>,
) => void;

export type TwapOrderFormInputError =
  | 'twap_duration_hours_invalid_input'
  | 'twap_duration_minutes_invalid_input'
  | 'twap_amount_per_suborder_size_below_min';

export type ScaledOrderFormInputError =
  | 'scaled_order_number_of_orders_invalid_input'
  | 'scaled_order_start_price_invalid_input'
  | 'scaled_order_start_price_invalid_price_increment'
  | 'scaled_order_end_price_invalid_input'
  | 'scaled_order_end_price_invalid_price_increment'
  | 'scaled_order_asset_amount_per_order_size_below_min';

export type OrderFormInputError =
  | 'invalid_size_input'
  | 'invalid_limit_price_input'
  | 'invalid_trigger_price_input'
  | 'max_exceeded'
  | 'invalid_size_increment'
  | 'invalid_price_increment'
  | 'invalid_limit_price_increment'
  | 'invalid_trigger_price_increment'
  | 'below_min'
  | 'time_in_force_in_days_invalid_input'
  | 'time_in_force_in_days_out_of_range'
  | TwapOrderFormInputError
  | ScaledOrderFormInputError;

export type OrderFormError =
  | OrderFormInputError
  | 'advanced_order_single_signature_disabled';

export interface OrderFormValidators {
  size: InputValidatorFn<string, OrderFormError>;
  limitPrice: InputValidatorFn<string, OrderFormError>;
  triggerPrice: InputValidatorFn<string, OrderFormError>;
  timeInForceInDays: InputValidatorFn<string, OrderFormError>;
  twapDurationHours: InputValidatorFn<string, OrderFormError>;
  twapDurationMinutes: InputValidatorFn<string, OrderFormError>;
  scaledOrderStartPrice: InputValidatorFn<string, OrderFormError>;
  scaledOrderEndPrice: InputValidatorFn<string, OrderFormError>;
  scaledOrderNumberOfOrders: InputValidatorFn<string, OrderFormError>;
}

export type TimeInForceType = 'gtc' | 'good_until' | 'ioc' | 'fok';

export type OrderFormSizeSource = 'size' | 'fraction';

export const ORDER_FORM_SIZE_DENOMS = ['asset', 'quote'] as const;
export type OrderFormSizeDenom = (typeof ORDER_FORM_SIZE_DENOMS)[number];

export interface OrderSettings {
  timeInForceType: TimeInForceType;
  timeInForceInDays: string;
  postOnly: boolean;
  reduceOnly: boolean;
  /** Only used for Perps. */
  isTpSlEnabled: boolean;
}

export interface TwapOrderFormValues {
  durationHours: string;
  durationMinutes: string;
  frequencyInSeconds: number;
  isRandomOrder: boolean;
}

export type OrderFormScaledOrderPriceDistributionType =
  | 'flat'
  | 'increasing'
  | 'decreasing';
export type OrderFormScaledOrderSizeDistributionType =
  | 'evenly_split'
  | 'increasing'
  | 'decreasing';

export interface ScaledOrderFormValues {
  numberOfOrders: string;
  priceDistributionType: OrderFormScaledOrderPriceDistributionType;
  sizeDistributionType: OrderFormScaledOrderSizeDistributionType;
  /** The starting price of the scaled order range. Can be higher or lower than endPrice. */
  startPrice: string;
  /** The ending price of the scaled order range. Can be higher or lower than startPrice. */
  endPrice: string;
}

export interface OrderFormValues {
  side: BalanceSide;
  orderType: PlaceOrderType;
  sizeSource: OrderFormSizeSource;
  size: string;
  sizeDenom: OrderFormSizeDenom;
  amountFraction: number;
  /** Limit price for limit orders. */
  limitPrice: string;
  /** Trigger price for stop orders. */
  triggerPrice: string;
  /** TWAP order values. */
  twapOrder: TwapOrderFormValues;
  /** Scaled order values. */
  scaledOrder: ScaledOrderFormValues;
  /** Order settings. */
  orderSettings: OrderSettings;
}
