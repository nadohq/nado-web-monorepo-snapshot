import {
  WithdrawErrorType,
  WithdrawFormValues,
} from 'client/modules/collateral/withdraw/types';
import { watchFormError } from 'client/utils/form/watchFormError';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Params {
  form: UseFormReturn<WithdrawFormValues>;
  suggestBorrowing: boolean;
}

export function useWithdrawAmountErrorTooltipContent({
  form,
  suggestBorrowing,
}: Params) {
  const { t } = useTranslation();

  const amountError: WithdrawErrorType | undefined = watchFormError(
    form,
    'amount',
  );

  if (!amountError) {
    return null;
  }

  return {
    max_exceeded: suggestBorrowing
      ? t(($) => $.errors.withdrawAmountExceedsWithdrawableSuggestBorrow)
      : t(($) => $.errors.withdrawAmountExceedsBorrowable),
    below_min: t(($) => $.errors.withdrawAmountBelowMinFee),
    invalid_input: t(($) => $.errors.invalidAmountInput),
    invalid_address: null,
  }[amountError];
}
