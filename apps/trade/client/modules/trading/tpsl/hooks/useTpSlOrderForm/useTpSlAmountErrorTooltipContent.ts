import { BigNumber } from 'bignumber.js';
import { TpSlOrderFormAmountErrorType } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Params {
  error: TpSlOrderFormAmountErrorType | undefined;
  minOrderSize: BigNumber | undefined;
  maxOrderSize: BigNumber | undefined;
  decimalAdjustedSizeIncrement: BigNumber | undefined;
}

export function useTpSlAmountErrorTooltipContent({
  error,
  minOrderSize,
  maxOrderSize,
  decimalAdjustedSizeIncrement: sizeIncrement,
}: Params) {
  const { t } = useTranslation();

  return useMemo(() => {
    switch (error) {
      case 'invalid_amount_input':
        return t(($) => $.errors.invalidAmountInput);
      case 'below_min':
        return t(($) => $.errors.belowMinAmount, {
          formattedMinValue: minOrderSize,
        });
      case 'max_exceeded':
        return t(($) => $.errors.maxOrderSizeExceeded, { maxOrderSize });
      case 'invalid_size_increment':
        return t(($) => $.errors.invalidSizeIncrement, { sizeIncrement });
      case undefined:
        return null;
    }
  }, [error, minOrderSize, maxOrderSize, sizeIncrement, t]);
}
