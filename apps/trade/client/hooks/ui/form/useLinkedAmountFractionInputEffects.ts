import { BigNumber } from 'bignumber.js';
import { LinkedAmountFractionFormValues } from 'client/types/linkedAmountFractionFormTypes';
import { toSafeFormFraction } from 'client/utils/form/toSafeFormFraction';
import { roundToIncrement, roundToString } from 'client/utils/rounding';
import { useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';

interface Params<T extends LinkedAmountFractionFormValues> {
  /**
   * Side effects run on changes of valid amounts
   */
  validAmount: BigNumber | undefined;
  validAmountFraction: number | undefined;
  /** Fractions are based on this maximum amount */
  maxAmount: BigNumber | undefined;
  form: UseFormReturn<T>;
  /**
   * If specified, the amount input will be rounded to this increment
   */
  amountIncrement?: BigNumber;
}

/**
 * Handles conversion between fractional and absolute amounts
 */
export function useLinkedAmountFractionInputEffects<
  T extends LinkedAmountFractionFormValues,
>({
  validAmountFraction,
  validAmount,
  maxAmount,
  form,
  amountIncrement,
}: Params<T>) {
  // React hook form doesn't work too well with constrained generics, so force cast here
  const typedForm =
    form as unknown as UseFormReturn<LinkedAmountFractionFormValues>;
  const { resetField, setValue, control } = typedForm;

  const amountSource = useWatch({
    control,
    name: 'amountSource',
  });
  // Triggered when user changes the amount input
  useEffect(() => {
    if (amountSource !== 'absolute') {
      return;
    }
    setValue('amountFraction', toSafeFormFraction(validAmount, maxAmount));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validAmount]);

  // Triggered when user changes the fraction input
  useEffect(() => {
    if (amountSource !== 'fraction') {
      return;
    }
    if (maxAmount != null && validAmountFraction != null) {
      const newAmountValue = maxAmount.multipliedBy(validAmountFraction);
      const newAmountInput = (() => {
        if (amountIncrement) {
          return roundToIncrement(newAmountValue, amountIncrement).toString();
        }
        // Use a more specific amount when the user selects 100% - this is to be more accurate with
        // the effects of `resolveAmountFractionSubmitValue`, which will use the _exact_ maximum amount if 100% is selected
        const decimals = validAmountFraction === 1 ? 8 : 4;
        return roundToString(
          maxAmount.multipliedBy(validAmountFraction),
          decimals,
        );
      })();

      setValue('amount', newAmountInput, { shouldValidate: true });
    } else {
      resetField('amount');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validAmountFraction]);
}
