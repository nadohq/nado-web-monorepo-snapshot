import { SUBACCOUNT_QUOTE_TRANSFER_MIN_AMOUNT_WITH_FEE } from '@nadohq/react-client';
import { InputValidatorFn, safeParseForData } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { SubaccountQuoteTransferErrorType } from 'client/modules/subaccounts/hooks/useSubaccountQuoteTransferForm/types';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';
import { useCallback } from 'react';

interface Params {
  maxAmount: BigNumber | undefined;
}

export function useSubaccountQuoteTransferAmountValidator({
  maxAmount,
}: Params) {
  return useCallback<
    InputValidatorFn<string, SubaccountQuoteTransferErrorType>
  >(
    (transferAmount) => {
      if (!transferAmount) {
        return;
      }

      const parsedInput = safeParseForData(
        positiveBigNumberValidator,
        transferAmount,
      );

      if (!parsedInput) {
        return 'invalid_input';
      }

      if (parsedInput.lt(SUBACCOUNT_QUOTE_TRANSFER_MIN_AMOUNT_WITH_FEE)) {
        return 'below_min';
      }

      if (!!maxAmount && parsedInput.gt(maxAmount)) {
        return 'max_exceeded';
      }
    },
    [maxAmount],
  );
}
