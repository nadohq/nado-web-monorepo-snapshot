import { InputValidatorFn } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { TriggerReferencePriceType } from 'client/modules/trading/types/TriggerReferencePriceType';
import { LinkedAmountFractionFormValues } from 'client/types/linkedAmountFractionFormTypes';
import { FieldPathByValue, UseFormReturn } from 'react-hook-form';
import { PartialDeep } from 'type-fest';

export type TpSlOrderFormTriggerPriceErrorType =
  | 'trigger_price_must_be_above_price'
  | 'trigger_price_must_be_below_price'
  | 'invalid_trigger_price_input';

export type TpSlOrderFormLimitPriceErrorType = 'invalid_limit_price_input';

export type TpSlOrderFormAmountErrorType =
  | 'invalid_amount_input'
  | 'max_exceeded'
  | 'below_min'
  | 'invalid_size_increment';

export type TpSlOrderFormErrorType =
  | TpSlOrderFormTriggerPriceErrorType
  | TpSlOrderFormLimitPriceErrorType
  | TpSlOrderFormAmountErrorType;

export type TriggerPriceSource = 'price' | 'gainOrLossValue';

export type GainOrLossInputType = 'percentage' | 'dollar';

/**
 * Values associated with price inputs in the TP/SL order form.
 * There are a separate set of inputs for take profit / stop loss
 */
export interface TpSlOrderFormPriceValues {
  triggerPrice: string;
  triggerReferencePriceType: TriggerReferencePriceType;
  gainOrLossValue: string;
  triggerPriceSource: TriggerPriceSource;
  gainOrLossInputType: GainOrLossInputType;
  isLimitOrder: boolean;
  limitPrice: string;
}

/**
 * Values associated with the amount inputs in the TP/SL order form.
 * These are shared between take profit and stop loss.
 */
export interface TpSlOrderFormAmountValues extends LinkedAmountFractionFormValues {
  isPartialOrder: boolean;
}

/**
 * Value interface for the totality of the TP/SL order form.
 * Note that the interface extends from TpSlOrderFormAmountValues instead of nesting
 * TpSlOrderFormAmountValues under an `amount` key to be compatible with `useLinkedAmountFractionInputEffects`.
 */
export interface TpSlOrderFormValues extends TpSlOrderFormAmountValues {
  tp: TpSlOrderFormPriceValues;
  sl: TpSlOrderFormPriceValues;
}

/**
 * Partial initial values for pre-populating the form.
 * Merged with defaults - any provided values override the defaults.
 */
export type TpSlOrderFormInitialValues = PartialDeep<TpSlOrderFormValues>;

/**
 * Key to access the price values in the top-level TpSlOrderFormValues.
 * This is either 'tp' for take profit or 'sl' for stop loss.
 */
export type TpSlFormPriceValuesKey = 'tp' | 'sl';

/**
 * Order form state for price inputs on a single TP or SL order.
 */
export interface TpSlOrderFormPriceState {
  triggerPriceError: TpSlOrderFormTriggerPriceErrorType | undefined;
  limitPriceError: TpSlOrderFormLimitPriceErrorType | undefined;
  validateTriggerPrice: InputValidatorFn<
    string,
    TpSlOrderFormTriggerPriceErrorType
  >;
  validateLimitPrice: InputValidatorFn<
    string,
    TpSlOrderFormLimitPriceErrorType
  >;
  validTriggerPrice: BigNumber | undefined;
  referencePrice: BigNumber | undefined;
  estimatedPnlUsd: BigNumber | undefined;
  estimatedPnlFrac: BigNumber | undefined;
  formError: TpSlOrderFormErrorType | undefined;
  /**
   * Indicates whether the order form has all required values filled in & valid.
   * i.e. this part of the form is ready to submit
   */
  hasRequiredValues: boolean;
  isTriggerPriceAbove: boolean;
  isLimitOrder: boolean;
  isTakeProfit: boolean;
  triggerReferencePriceType: TriggerReferencePriceType;
  formPriceValuesKey: TpSlFormPriceValuesKey;
  /**
   * Clears the trigger price and limit price inputs for this TP/SL order.
   */
  clearInputs: () => void;
}

export interface TpSlOrderFormAmountState {
  validAmount: BigNumber | undefined;
  validAmountFraction: number | undefined;
  amountFractionInput: number;
  amountInputError: TpSlOrderFormAmountErrorType | undefined;
  amountFormError: TpSlOrderFormAmountErrorType | undefined;
  /**
   * Indicates whether the order form has all required values filled in & valid.
   * i.e. this part of the form is ready to submit
   */
  hasRequiredValues: boolean;
  validateAmountInput: InputValidatorFn<string, TpSlOrderFormAmountErrorType>;
  isPartialOrder: boolean;
  minOrderSize: BigNumber | undefined;
  maxOrderSize: BigNumber | undefined;
}

export interface TpSlSubmitHandlerValues extends TpSlOrderFormValues {
  /**
   * If provided, the TP/SL will only be placed if the order associated with this
   * digest is successfully filled
   */
  orderDigest?: string;
}

export interface UseTpSlOrderForm {
  form: UseFormReturn<TpSlOrderFormValues>;
  tpState: TpSlOrderFormPriceState;
  slState: TpSlOrderFormPriceState;
  amountState: TpSlOrderFormAmountState;
  onFractionChange: (fraction: number) => void;
  // Submit handler fn, not wrapped by the RHF handleSubmit
  submitHandler: (values: TpSlSubmitHandlerValues) => void;
  // Submit handler for the form, used by the dialog
  onFormSubmit: () => void;
  // Submit state
  isSubmitting: boolean;
  isSuccess: boolean;
  // Focus tracking for clickable price values
  setActiveField: (
    field: FieldPathByValue<TpSlOrderFormValues, string>,
  ) => void;
  handlePriceClick: (price: BigNumber) => void;
}
