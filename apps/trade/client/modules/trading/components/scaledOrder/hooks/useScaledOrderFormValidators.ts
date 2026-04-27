import { InputValidatorFn } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import {
  SCALED_ORDER_MAX_NUMBER_OF_ORDERS,
  SCALED_ORDER_MIN_NUMBER_OF_ORDERS,
} from 'client/modules/trading/consts/scaledOrder';
import { OrderFormError } from 'client/modules/trading/types/orderFormTypes';
import { isValidIncrementAmount } from 'client/modules/trading/utils/isValidIncrementAmount';
import {
  getRangeBigNumberValidator,
  positiveBigNumberValidator,
} from 'client/utils/inputValidators';
import { useCallback } from 'react';

interface Params {
  priceIncrement: BigNumber | undefined;
}

/**
 * Provides validation functions for scaled order form fields.
 * Start and end prices can be in any order - normalization happens internally.
 * @param params - Parameters for the function.
 * @returns Validation functions for scaled order fields
 */
export function useScaledOrderFormValidators({ priceIncrement }: Params) {
  const validateScaledOrderStartPrice = useCallback<
    InputValidatorFn<string, OrderFormError>
  >(
    (val) => {
      if (!val) {
        return;
      }

      const startPrice = positiveBigNumberValidator.safeParse(val);

      if (!startPrice.success) {
        return 'scaled_order_start_price_invalid_input';
      }

      if (priceIncrement && !isValidIncrementAmount(val, priceIncrement)) {
        return 'scaled_order_start_price_invalid_price_increment';
      }
    },
    [priceIncrement],
  );

  const validateScaledOrderEndPrice = useCallback<
    InputValidatorFn<string, OrderFormError>
  >(
    (val) => {
      if (!val) {
        return;
      }

      const endPrice = positiveBigNumberValidator.safeParse(val);

      if (!endPrice.success) {
        return 'scaled_order_end_price_invalid_input';
      }

      if (priceIncrement && !isValidIncrementAmount(val, priceIncrement)) {
        return 'scaled_order_end_price_invalid_price_increment';
      }
    },
    [priceIncrement],
  );

  const validateScaledOrderNumberOfOrders = useCallback<
    InputValidatorFn<string, OrderFormError>
  >((val) => {
    if (!val) {
      return;
    }

    const numberOfOrders = getRangeBigNumberValidator({
      minInclusive: SCALED_ORDER_MIN_NUMBER_OF_ORDERS,
      maxInclusive: SCALED_ORDER_MAX_NUMBER_OF_ORDERS,
    }).safeParse(val);

    if (!numberOfOrders.success || !numberOfOrders.data.isInteger()) {
      return 'scaled_order_number_of_orders_invalid_input';
    }
  }, []);

  return {
    validateScaledOrderStartPrice,
    validateScaledOrderEndPrice,
    validateScaledOrderNumberOfOrders,
  };
}
