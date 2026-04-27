import { InputValidatorFn, safeParseForData } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { isValidIncrementAmount } from 'client/modules/trading/utils/isValidIncrementAmount';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';
import { useCallback } from 'react';

export type EditOrderFieldErrorType =
  | 'invalid_input'
  | 'invalid_increment'
  | 'value_unchanged'
  | 'below_min';

export function useEditOrderFieldValidator(
  increment: BigNumber | undefined,
  currentValue: BigNumber,
  minSize: BigNumber | undefined,
): InputValidatorFn<string, EditOrderFieldErrorType> {
  return useCallback(
    (val) => {
      if (!val) {
        return;
      }

      const parsedValue = safeParseForData(positiveBigNumberValidator, val);
      if (!parsedValue) {
        return 'invalid_input';
      }

      if (increment && !isValidIncrementAmount(val, increment)) {
        return 'invalid_increment';
      }

      if (minSize && parsedValue.lt(minSize)) {
        return 'below_min';
      }

      if (parsedValue.eq(currentValue)) {
        return 'value_unchanged';
      }
    },
    [increment, currentValue, minSize],
  );
}
