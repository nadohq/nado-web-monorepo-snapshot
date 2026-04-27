import { toBigNumber } from '@nadohq/client';
import {
  InputValidatorFn,
  positiveNumberValidator,
  safeParseForData,
} from '@nadohq/web-common';
import { OrderSlippageType } from 'client/modules/localstorage/userState/types/tradingSettings';
import { useOrderSlippageSettings } from 'client/modules/trading/hooks/useOrderSlippageSettings';
import { watchFormError } from 'client/utils/form/watchFormError';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm, UseFormReturn, useWatch } from 'react-hook-form';

export type UseOrderFormSlippageErrorType = 'invalid_input';

interface Values {
  value: number;
}

export interface UseOrderSlippageSettingForType {
  slippageType: OrderSlippageType;
  form: UseFormReturn<Values>;
  // We show a warning if the user tries to apply a slippage value that is too low
  isLowSlippage: boolean;
  formError: UseOrderFormSlippageErrorType | undefined;
  validateSlippageInput: InputValidatorFn<
    number,
    UseOrderFormSlippageErrorType
  >;
  resetToDefault: () => void;
  save: () => void;
}

/**
 * Instead of having 1 combined form for slippage, each field is saved independently and has its own state,
 * so it becomes much easier to handle 1 form per field to avoid duplication.
 *
 * Note: Saved slippage values are fractions, but the form uses percentages for more readable input
 */
export function useOrderSlippageSettingForType(
  type: OrderSlippageType,
): UseOrderSlippageSettingForType {
  const { savedSettings, defaults, setSavedSettingsForType } =
    useOrderSlippageSettings();
  const savedSlippagePercentageValue = fractionToPercentage(
    savedSettings[type],
  );
  const defaultSlippagePercentageValue = fractionToPercentage(defaults[type]);

  // Form state
  const form = useForm<Values>({
    defaultValues: {
      value: savedSlippagePercentageValue,
    },
    // Because we save on blur, validation needs to be on change
    mode: 'onChange',
  });
  const inputValue = useWatch({
    control: form.control,
    name: 'value',
  });
  const inputError: UseOrderFormSlippageErrorType | undefined = watchFormError(
    form,
    'value',
  );

  // Sync on settings change
  useEffect(() => {
    form.setValue('value', savedSlippagePercentageValue, {
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [savedSlippagePercentageValue, form]);

  const validateSlippageInput = useCallback(
    (input: number): UseOrderFormSlippageErrorType | undefined => {
      const parseResult = safeParseForData(positiveNumberValidator, input);

      if (!parseResult) {
        return 'invalid_input';
      }
    },
    [],
  );

  const isLowSlippage = useMemo(() => {
    // Warn if input is < 0.1%
    return !!inputValue && inputValue > 0 && inputValue < 0.1;
  }, [inputValue]);

  const resetToDefault = useCallback(() => {
    form.setValue('value', defaultSlippagePercentageValue, {
      shouldTouch: true,
      shouldValidate: true,
    });
    setSavedSettingsForType(
      type,
      percentageToFraction(defaultSlippagePercentageValue),
    );
  }, [defaultSlippagePercentageValue, form, setSavedSettingsForType, type]);

  const save = useCallback(() => {
    const parseResult = safeParseForData(positiveNumberValidator, inputValue);
    if (parseResult) {
      setSavedSettingsForType(type, percentageToFraction(parseResult));
    } else {
      resetToDefault();
    }
  }, [inputValue, resetToDefault, setSavedSettingsForType, type]);

  return {
    slippageType: type,
    form,
    formError: inputError,
    isLowSlippage,
    validateSlippageInput,
    resetToDefault,
    save,
  };
}

// Simply dividing / multiplying will introduce JS floating point precision errors
// https://stackoverflow.com/questions/1458633/how-can-i-deal-with-floating-point-number-precision-in-javascript/24317981
/**
 * Convert fraction to percentage handling floating point precision
 */
function fractionToPercentage(fraction: number) {
  return toBigNumber(fraction).multipliedBy(100).toNumber();
}

function percentageToFraction(percentage: number) {
  return toBigNumber(percentage).div(100).toNumber();
}
