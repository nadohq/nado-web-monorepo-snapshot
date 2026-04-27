import { BigNumber } from 'bignumber.js';
import { PerpLeverageDialogFormValues } from 'client/pages/PerpTrading/components/PerpLeverageDialog/hooks/usePerpLeverageDialog';
import { roundToIncrement } from 'client/utils/rounding';
import { useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';

function toSafeFormSliderValue(
  numerator: BigNumber | undefined,
  minLeverage: number,
  leverageIncrement: number,
) {
  if (!numerator) {
    return minLeverage;
  }

  return roundToIncrement(numerator, leverageIncrement).toNumber();
}

interface Params {
  validLeverageAmount: BigNumber | undefined;
  validLeverageSliderValue: number | undefined;
  minLeverage: number;
  leverageIncrement: number;
  form: UseFormReturn<PerpLeverageDialogFormValues>;
}

/**
 * Handles side effects for the perpetual leverage dialog form
 */
export function usePerpLeverageDialogFormOnChangeSideEffects({
  validLeverageSliderValue,
  validLeverageAmount,
  form,
  minLeverage,
  leverageIncrement,
}: Params) {
  const leverageAmountSource = useWatch({
    control: form.control,
    name: 'leverageAmountSource',
  });
  const { resetField, setValue } = form;

  // Triggered when user changes the amount input
  useEffect(() => {
    if (leverageAmountSource !== 'absolute') {
      return;
    }
    setValue(
      'leverageSliderValue',
      toSafeFormSliderValue(
        validLeverageAmount,
        minLeverage,
        leverageIncrement,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validLeverageAmount]);

  // Triggered when user changes the slider value input
  useEffect(() => {
    if (leverageAmountSource !== 'slider_value') {
      return;
    }
    if (validLeverageSliderValue != null) {
      setValue(
        'leverageAmount',
        roundToIncrement(
          validLeverageSliderValue,
          leverageIncrement,
        ).toString(),
        {
          shouldValidate: true,
        },
      );
    } else {
      resetField('leverageAmount');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validLeverageSliderValue]);
}
