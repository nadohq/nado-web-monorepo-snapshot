import { UseOrderFormSlippageErrorType } from 'client/modules/settings/components/OrderSlippageSettings/hooks/useOrderSlippageFormForType';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useOrderSlippageValueErrorTooltipContent({
  formError,
}: {
  formError: UseOrderFormSlippageErrorType | undefined;
}) {
  const { t } = useTranslation();

  return useMemo(() => {
    switch (formError) {
      case 'invalid_input':
        return t(($) => $.errors.invalidSlippageInput);
      default:
        return null;
    }
  }, [formError, t]);
}
