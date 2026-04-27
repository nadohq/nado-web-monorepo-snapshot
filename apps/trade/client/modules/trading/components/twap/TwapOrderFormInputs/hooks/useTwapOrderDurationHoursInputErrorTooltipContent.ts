import { OrderFormError } from 'client/modules/trading/types/orderFormTypes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useTwapOrderDurationHoursInputErrorTooltipContent({
  formError,
}: {
  formError: OrderFormError | undefined;
}) {
  const { t } = useTranslation();

  return useMemo(() => {
    switch (formError) {
      case 'twap_duration_hours_invalid_input':
        return t(($) => $.errors.twapDurationHoursInvalidInput);
      default:
        return null;
    }
  }, [formError, t]);
}
