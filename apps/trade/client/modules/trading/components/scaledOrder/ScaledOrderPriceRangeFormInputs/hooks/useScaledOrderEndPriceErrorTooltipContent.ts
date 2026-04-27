import { BigNumber } from 'bignumber.js';
import { OrderFormError } from 'client/modules/trading/types/orderFormTypes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useScaledOrderEndPriceErrorTooltipContent({
  formError,
  priceIncrement,
}: {
  formError: OrderFormError | undefined;
  priceIncrement: BigNumber | undefined;
}) {
  const { t } = useTranslation();

  return useMemo(() => {
    switch (formError) {
      case 'scaled_order_end_price_invalid_input':
        return t(($) => $.errors.pleaseEnterValidEndPrice);
      case 'scaled_order_end_price_invalid_price_increment':
        return t(($) => $.errors.invalidPriceIncrement, { priceIncrement });
      default:
        return null;
    }
  }, [formError, priceIncrement, t]);
}
