import { toBigNumber } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { LinkedAmountFractionFormValues } from 'client/types/linkedAmountFractionFormTypes';
/**
 * A util function that takes the submitted form values and resolves the amount to submit, essentially
 * taking the _exact_ maxValue if the amountFraction is 1 (100%)
 *
 * @param formValues
 * @param maxValue
 */
export function resolveAmountFractionSubmitValue(
  formValues: LinkedAmountFractionFormValues,
  maxValue: BigNumber | undefined,
) {
  if (formValues.amountFraction === 1 && maxValue != null) {
    return maxValue;
  }
  return toBigNumber(formValues.amount);
}
