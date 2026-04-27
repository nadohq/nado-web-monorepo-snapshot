import {
  SCALED_ORDER_MAX_NUMBER_OF_ORDERS,
  SCALED_ORDER_MIN_NUMBER_OF_ORDERS,
} from 'client/modules/trading/consts/scaledOrder';
import { OrderFormError } from 'client/modules/trading/types/orderFormTypes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useScaledOrderNumberOfOrdersErrorTooltipContent({
  formError,
}: {
  formError: OrderFormError | undefined;
}) {
  const { t } = useTranslation();

  return useMemo(() => {
    switch (formError) {
      case 'scaled_order_number_of_orders_invalid_input':
        return t(($) => $.errors.pleaseEnterNumberBetweenMinAndMax, {
          min: SCALED_ORDER_MIN_NUMBER_OF_ORDERS,
          max: SCALED_ORDER_MAX_NUMBER_OF_ORDERS,
        });
      default:
        return null;
    }
  }, [formError, t]);
}
