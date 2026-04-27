import { BigNumber } from 'bignumber.js';
import {
  PlaceOrderType,
  PRICE_TRIGGER_PLACE_ORDER_TYPES,
} from 'client/modules/trading/types/placeOrderTypes';

interface Params {
  validatedSizeInput: BigNumber | undefined;
  executionConversionPrice: BigNumber | undefined;
  orderType: PlaceOrderType;
  validatedTriggerPriceInput: BigNumber | undefined;
  validatedScaledOrderStartPriceInput: BigNumber | undefined;
  validatedScaledOrderEndPriceInput: BigNumber | undefined;
  validatedScaledOrderNumberOfOrdersInput: BigNumber | undefined;
  validatedTwapDurationHoursInput: BigNumber | undefined;
  validatedTwapDurationMinutesInput: BigNumber | undefined;
}

/**
 * Checks if the order form has all required inputs to be submitted.
 */
export function hasRequiredOrderFormInputs({
  validatedSizeInput,
  executionConversionPrice,
  orderType,
  validatedTriggerPriceInput,
  validatedScaledOrderStartPriceInput,
  validatedScaledOrderEndPriceInput,
  validatedScaledOrderNumberOfOrdersInput,
  validatedTwapDurationHoursInput,
  validatedTwapDurationMinutesInput,
}: Params): boolean {
  // All orders require size and a execution conversion price
  if (!validatedSizeInput || !executionConversionPrice) {
    return false;
  }

  // Stop market and limit orders require a trigger price.
  if (
    PRICE_TRIGGER_PLACE_ORDER_TYPES.includes(orderType) &&
    !validatedTriggerPriceInput
  ) {
    return false;
  }

  const hasRequiredScaledOrderInputs = Boolean(
    validatedScaledOrderStartPriceInput &&
    validatedScaledOrderEndPriceInput &&
    validatedScaledOrderNumberOfOrdersInput,
  );

  if (orderType === 'multi_limit' && !hasRequiredScaledOrderInputs) {
    return false;
  }

  // if either duration hours or minutes is a valid positive number, then the duration is valid
  const hasRequiredTwapDuration = Boolean(
    validatedTwapDurationHoursInput || validatedTwapDurationMinutesInput,
  );

  if (orderType === 'twap' && !hasRequiredTwapDuration) {
    return false;
  }

  return true;
}
