import { TpSlOrderFormLimitPriceErrorType } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Params {
  error: TpSlOrderFormLimitPriceErrorType | undefined;
}

export function useTpSlLimitPriceErrorTooltipContent({ error }: Params) {
  const { t } = useTranslation();

  return useMemo(() => {
    switch (error) {
      case 'invalid_limit_price_input':
        return t(($) => $.errors.invalidPriceInput);
      case undefined:
        return null;
    }
  }, [error, t]);
}
