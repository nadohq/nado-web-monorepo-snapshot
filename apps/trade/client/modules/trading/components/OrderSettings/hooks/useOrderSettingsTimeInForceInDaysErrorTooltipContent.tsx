import { OrderFormError } from 'client/modules/trading/types/orderFormTypes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useOrderSettingsTimeInForceInDaysErrorTooltipContent({
  formError,
}: {
  formError: OrderFormError | undefined;
}) {
  const { t } = useTranslation();

  return useMemo(() => {
    switch (formError) {
      case 'time_in_force_in_days_invalid_input':
        return t(($) => $.errors.timeInForceInDaysInvalidInput);
      case 'time_in_force_in_days_out_of_range':
        return t(($) => $.errors.timeInForceInDaysOutOfRange);
      default:
        return null;
    }
  }, [formError, t]);
}
