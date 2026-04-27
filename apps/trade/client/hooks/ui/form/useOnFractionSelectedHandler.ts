import { LinkedAmountFractionFormValues } from 'client/types/linkedAmountFractionFormTypes';
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

export type OnFractionSelectedHandler = (fraction: number) => void;

interface Params<T extends LinkedAmountFractionFormValues> {
  setValue: UseFormReturn<T>['setValue'];
}

/**
 * Callback for a standard linked fraction/amount input form
 */
export function useOnFractionSelectedHandler<
  T extends LinkedAmountFractionFormValues,
>({ setValue }: Params<T>) {
  // React hook form doesn't work too well with constrained generics, so force cast here
  const typedSetValue =
    setValue as unknown as UseFormReturn<LinkedAmountFractionFormValues>['setValue'];

  return useCallback(
    (fraction: number) => {
      if (fraction != null && isFinite(fraction)) {
        typedSetValue('amountSource', 'fraction');
        typedSetValue('amountFraction', fraction);
      }
    },
    [typedSetValue],
  );
}
