import { SUBACCOUNT_QUOTE_TRANSFER_MIN_AMOUNT_WITH_FEE } from '@nadohq/react-client';
import { IsolatedAdjustMarginFormErrorType } from 'client/modules/trading/hooks/useIsolatedAdjustMarginForm/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Params {
  formError: IsolatedAdjustMarginFormErrorType | undefined;
}

export function useIsolatedAdjustMarginAmountErrorTooltipContent({
  formError,
}: Params) {
  const { t } = useTranslation();

  return useMemo(() => {
    switch (formError) {
      case 'add_max_exceeded':
        return t(($) => $.errors.addMaxExceeded);
      case 'invalid_input':
        return t(($) => $.errors.invalidAmountInput);
      case 'remove_max_exceeded':
        return t(($) => $.errors.removeMaxExceeded);
      case 'below_min':
        return t(($) => $.errors.belowMinAmount, {
          formattedMinValue:
            SUBACCOUNT_QUOTE_TRANSFER_MIN_AMOUNT_WITH_FEE.toString(),
        });
      default:
        return null;
    }
  }, [formError, t]);
}
