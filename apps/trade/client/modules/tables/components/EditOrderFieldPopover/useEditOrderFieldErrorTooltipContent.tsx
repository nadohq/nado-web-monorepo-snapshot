import { BigNumber } from 'bignumber.js';
import { EditOrderFieldErrorType } from 'client/modules/tables/components/EditOrderFieldPopover/useEditOrderFieldValidator';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useEditOrderFieldErrorTooltipContent(
  error: EditOrderFieldErrorType | undefined,
  increment: BigNumber | undefined,
  minSize: BigNumber | undefined,
): string | undefined {
  const { t } = useTranslation();

  return useMemo(() => {
    switch (error) {
      case 'invalid_input':
        return t(($) => $.errors.invalidPriceInput);
      case 'invalid_increment':
        return t(($) => $.errors.mustBeMultipleOfIncrement, {
          increment: increment?.toString() ?? '',
        });
      case 'value_unchanged':
        return t(($) => $.errors.valueIsUnchanged);
      case 'below_min':
        return t(($) => $.errors.belowMinAmount, {
          formattedMinValue: minSize?.toString() ?? '',
        });
      default:
        return undefined;
    }
  }, [error, increment, minSize, t]);
}
