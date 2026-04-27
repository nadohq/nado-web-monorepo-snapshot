import { WithdrawNlpLiquidityFormErrorType } from 'client/modules/nlp/withdraw/hooks/useWithdrawNlpLiquidityDialog';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useWithdrawNlpLiquidityAmountErrorTooltipContent({
  formError,
}: {
  formError: WithdrawNlpLiquidityFormErrorType | undefined;
}) {
  const { t } = useTranslation();

  return useMemo(() => {
    switch (formError) {
      case 'invalid_input':
        return t(($) => $.errors.invalidAmountInput);
      case 'max_exceeded':
        return t(($) => $.errors.maxExceeded);
      default:
        return null;
    }
  }, [formError, t]);
}
