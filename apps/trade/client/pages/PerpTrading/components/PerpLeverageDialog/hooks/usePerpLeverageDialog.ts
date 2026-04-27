import {
  InputValidatorFn,
  positiveNumberValidator,
  safeParseForData,
} from '@nadohq/web-common';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { isValidIncrementAmount } from 'client/modules/trading/utils/isValidIncrementAmount';
import { usePerpLeverageDialogFormOnChangeSideEffects } from 'client/pages/PerpTrading/components/PerpLeverageDialog/hooks/usePerpLeverageDialogFormOnChangeSideEffects';
import { useSelectedPerpMarginMode } from 'client/pages/PerpTrading/hooks/useSelectedPerpMarginMode';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { watchFormError } from 'client/utils/form/watchFormError';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';

export type PerpLeverageAmountSource = 'absolute' | 'slider_value';

export interface PerpLeverageDialogFormValues {
  leverageAmount: string;
  leverageSliderValue: number;
  leverageAmountSource: PerpLeverageAmountSource;
}

export type PerpLeverageDialogFormLeverageAmountErrorType =
  | 'invalid_input'
  | 'below_min'
  | 'invalid_increment'
  | 'above_max';

export function usePerpLeverageDialog({ productId }: { productId: number }) {
  const { hide } = useDialog();
  const {
    selectedMarginMode: savedMarginMode,
    setSelectedMarginMode: setSavedMarginMode,
  } = useSelectedPerpMarginMode(productId);
  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const currentMarket = allMarketsStaticData?.perpMarkets[productId];

  const minLeverage = 1;
  const maxLeverage = currentMarket?.maxLeverage ?? minLeverage;
  const leverageIncrement = 0.5;

  // Form setup
  const form = useForm<PerpLeverageDialogFormValues>({
    defaultValues: {
      leverageAmount: maxLeverage.toString(),
      leverageSliderValue: maxLeverage,
      leverageAmountSource: 'absolute',
    },
    mode: 'onChange',
  });

  const { register, setValue, handleSubmit } = form;

  // Watched values
  const [leverageAmountSource, leverageAmount, leverageSliderValue] = useWatch({
    control: form.control,
    name: ['leverageAmountSource', 'leverageAmount', 'leverageSliderValue'],
  });

  // Sync form with saved data when it changes
  useEffect(() => {
    setValue('leverageAmount', savedMarginMode.leverage.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedMarginMode.leverage]);

  // Validation
  const validateLeverageAmount = useCallback<
    InputValidatorFn<string, PerpLeverageDialogFormLeverageAmountErrorType>
  >(
    (val: string) => {
      const parsedLeverage = safeParseForData(positiveBigNumberValidator, val);

      if (!parsedLeverage) {
        return 'invalid_input';
      }

      if (parsedLeverage.lt(minLeverage)) {
        return 'below_min';
      }

      if (parsedLeverage.gt(maxLeverage)) {
        return 'above_max';
      }

      if (!isValidIncrementAmount(parsedLeverage, leverageIncrement)) {
        return 'invalid_increment';
      }

      return undefined;
    },
    [minLeverage, maxLeverage],
  );

  const leverageAmountError:
    | PerpLeverageDialogFormLeverageAmountErrorType
    | undefined = watchFormError(form, 'leverageAmount');

  const leverageAmountInputRegister = register('leverageAmount', {
    validate: validateLeverageAmount,
  });

  // Parsed values
  const validLeverageAmount = useMemo(() => {
    return safeParseForData(positiveBigNumberValidator, leverageAmount);
  }, [leverageAmount]);

  const validLeverageSliderValue = useMemo(() => {
    return safeParseForData(positiveNumberValidator, leverageSliderValue);
  }, [leverageSliderValue]);

  usePerpLeverageDialogFormOnChangeSideEffects({
    validLeverageAmount,
    validLeverageSliderValue,
    form,
    minLeverage,
    leverageIncrement,
  });

  // This fires only on direct change, not when `useForm` triggers a value change, so this is safe to do
  const onSliderValueChange = useCallback(
    (sliderValue: number) => {
      if (leverageAmountSource !== 'slider_value') {
        setValue('leverageAmountSource', 'slider_value');
      }
      setValue('leverageSliderValue', sliderValue);
    },
    [leverageAmountSource, setValue],
  );

  const onSubmit = useCallback(
    (values: PerpLeverageDialogFormValues) => {
      // Update the saved margin mode with new leverage, keeping other settings
      setSavedMarginMode({
        ...savedMarginMode,
        leverage: Number(values.leverageAmount),
      });

      hide();
    },
    [savedMarginMode, hide, setSavedMarginMode],
  );

  const buttonState = useMemo((): BaseActionButtonState => {
    if (leverageAmountError) {
      return 'disabled';
    }

    return 'idle';
  }, [leverageAmountError]);

  return {
    form,
    hide,
    marginModeType: savedMarginMode.mode,
    currentMarket,
    leverageAmountInputRegister,
    leverageAmountError,
    minLeverage,
    maxLeverage,
    leverageIncrement,
    leverageSliderValue,
    onSubmit: handleSubmit(onSubmit),
    onSliderValueChange,
    buttonState,
  };
}
