import { BigNumber } from 'bignumber.js';
import { ClosePositionFormErrorType } from 'client/modules/trading/closePosition/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Params {
  limitPriceInputError: ClosePositionFormErrorType | undefined;
  priceIncrement: BigNumber | undefined;
}

export function useClosePositionPriceErrorTooltipContent({
  limitPriceInputError,
  priceIncrement,
}: Params) {
  const { t } = useTranslation();
  return useMemo(() => {
    switch (limitPriceInputError) {
      case 'invalid_price_input':
        return t(($) => $.errors.invalidPriceInput);
      case 'invalid_price_increment':
        return t(($) => $.errors.invalidPriceIncrement, { priceIncrement });
      default:
        return null;
    }
  }, [limitPriceInputError, priceIncrement, t]);
}
