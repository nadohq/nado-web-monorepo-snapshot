import { SUBACCOUNT_QUOTE_TRANSFER_MIN_AMOUNT_WITH_FEE } from '@nadohq/react-client';
import { InputValidatorFn, safeParseForData } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { IsolatedAdjustMarginFormErrorType } from 'client/modules/trading/hooks/useIsolatedAdjustMarginForm/types';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';
import { useCallback } from 'react';

interface Params {
  maxWithdrawable: BigNumber | undefined;
  isAddMargin: boolean;
}

export function useIsolatedAdjustMarginAmountValidator({
  maxWithdrawable,
  isAddMargin,
}: Params) {
  return useCallback<
    InputValidatorFn<string, IsolatedAdjustMarginFormErrorType>
  >(
    (amount) => {
      if (!amount) {
        return;
      }

      const parsedInput = safeParseForData(positiveBigNumberValidator, amount);

      if (!parsedInput) {
        return 'invalid_input';
      }

      if (parsedInput.lt(SUBACCOUNT_QUOTE_TRANSFER_MIN_AMOUNT_WITH_FEE)) {
        return 'below_min';
      }

      if (!!maxWithdrawable && parsedInput.gt(maxWithdrawable)) {
        return isAddMargin ? 'add_max_exceeded' : 'remove_max_exceeded';
      }
    },
    [maxWithdrawable, isAddMargin],
  );
}
