import { OrderFormError } from 'client/modules/trading/types/orderFormTypes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  formError: OrderFormError | undefined;
}

export function useTwapOrderDurationMinutesInputErrorTooltipContent({
  formError,
}: Props) {
  const { t } = useTranslation();

  return useMemo(() => {
    switch (formError) {
      case 'twap_duration_minutes_invalid_input':
        return t(($) => $.errors.twapDurationMinutesInvalidInput);
      default:
        return null;
    }
  }, [formError, t]);
}
