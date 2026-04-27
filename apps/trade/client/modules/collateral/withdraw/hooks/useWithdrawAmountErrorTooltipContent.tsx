import { WithdrawErrorType } from 'client/modules/collateral/withdraw/types';
import { useTranslation } from 'react-i18next';

interface Params {
  formError: WithdrawErrorType | undefined;
  suggestBorrowing: boolean;
}

export function useWithdrawAmountErrorTooltipContent({
  formError,
  suggestBorrowing,
}: Params) {
  const { t } = useTranslation();

  if (!formError) {
    return null;
  }

  return {
    max_exceeded: suggestBorrowing
      ? t(($) => $.errors.withdrawAmountExceedsWithdrawableSuggestBorrow)
      : t(($) => $.errors.withdrawAmountExceedsBorrowable),
    below_min: t(($) => $.errors.withdrawAmountBelowMinFee),
    invalid_input: t(($) => $.errors.invalidAmountInput),
  }[formError];
}
