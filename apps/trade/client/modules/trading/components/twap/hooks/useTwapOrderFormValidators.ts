import { InputValidatorFn } from '@nadohq/web-common';
import { TwapOrderFormInputError } from 'client/modules/trading/types/orderFormTypes';
import { getRangeBigNumberValidator } from 'client/utils/inputValidators';
import { useCallback } from 'react';

export function useTwapOrderFormValidators() {
  const validateTwapDurationHours = useCallback<
    InputValidatorFn<string, TwapOrderFormInputError>
  >((val) => {
    if (!val) {
      return;
    }

    const durationHours = getRangeBigNumberValidator({
      maxInclusive: 24,
      minInclusive: 0,
    }).safeParse(val);

    if (!durationHours.success || !durationHours.data.isInteger()) {
      return 'twap_duration_hours_invalid_input';
    }
  }, []);

  const validateTwapDurationMinutes = useCallback<
    InputValidatorFn<string, TwapOrderFormInputError>
  >((val) => {
    if (!val) {
      return;
    }

    const durationMinutes = getRangeBigNumberValidator({
      maxInclusive: 59,
      minInclusive: 0,
    }).safeParse(val);

    if (!durationMinutes.success || !durationMinutes.data.isInteger()) {
      return 'twap_duration_minutes_invalid_input';
    }
  }, []);

  return {
    validateTwapDurationHours,
    validateTwapDurationMinutes,
  };
}
