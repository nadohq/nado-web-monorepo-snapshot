import { BigNumber } from 'bignumber.js';
import { OrderFormError } from 'client/modules/trading/types/orderFormTypes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useOrderFormTriggerPriceErrorTooltipContent({
  formError,
  priceIncrement,
}: {
  formError: OrderFormError | undefined;
  priceIncrement: BigNumber | undefined;
}) {
  const { t } = useTranslation();

  return useMemo(() => {
    switch (formError) {
      case 'invalid_trigger_price_input':
        return t(($) => $.errors.invalidPriceInput);
      case 'invalid_trigger_price_increment':
        return t(($) => $.errors.invalidPriceIncrement, { priceIncrement });
      default:
        return null;
    }
  }, [formError, priceIncrement, t]);
}
