import { SEQUENCER_FEE_AMOUNT_USDT } from '@nadohq/react-client';
import { DepositNlpLiquidityFormErrorType } from 'client/modules/nlp/deposit/hooks/useDepositNlpLiquidityDialog';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Params {
  formError: DepositNlpLiquidityFormErrorType | undefined;
}

export function useDepositNlpLiquidityAmountErrorTooltipContent({
  formError,
}: Params) {
  const { t } = useTranslation();

  return useMemo(() => {
    switch (formError) {
      case 'invalid_input':
        return t(($) => $.errors.invalidAmountInput);
      case 'max_exceeded':
        return t(($) => $.errors.maxExceeded);
      case 'below_min':
        return t(($) => $.errors.belowMinAmount, {
          formattedMinValue: SEQUENCER_FEE_AMOUNT_USDT,
        });
      default:
        return null;
    }
  }, [formError, t]);
}
