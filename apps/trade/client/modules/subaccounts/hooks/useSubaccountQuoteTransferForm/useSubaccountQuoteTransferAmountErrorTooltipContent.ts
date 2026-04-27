import { SUBACCOUNT_QUOTE_TRANSFER_MIN_AMOUNT_WITH_FEE } from '@nadohq/react-client';
import { SubaccountQuoteTransferErrorType } from 'client/modules/subaccounts/hooks/useSubaccountQuoteTransferForm/types';
import { useTranslation } from 'react-i18next';

interface Params {
  formError: SubaccountQuoteTransferErrorType | undefined;
}

export function useSubaccountQuoteTransferAmountErrorTooltipContent({
  formError,
}: Params) {
  const { t } = useTranslation();

  switch (formError) {
    case 'max_exceeded':
      return t(($) => $.errors.maxExceeded);
    case 'invalid_input':
      return t(($) => $.errors.invalidAmountInput);
    case 'below_min':
      return t(($) => $.errors.belowMinAmount, {
        formattedMinValue:
          SUBACCOUNT_QUOTE_TRANSFER_MIN_AMOUNT_WITH_FEE.toString(),
      });
    default:
      return null;
  }
}
