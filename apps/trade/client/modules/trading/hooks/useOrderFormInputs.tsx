import { BigNumber } from 'bignumber.js';
import { useOrderFormLimitPriceErrorTooltipContent } from 'client/modules/trading/hooks/useOrderFormLimitPriceErrorTooltipContent';
import { useOrderFormSizeErrorTooltipContent } from 'client/modules/trading/hooks/useOrderFormSizeErrorTooltipContent';
import { useOrderFormTriggerPriceErrorTooltipContent } from 'client/modules/trading/hooks/useOrderFormTriggerPriceErrorTooltipContent';
import {
  OrderFormError,
  OrderFormSizeDenom,
  OrderFormValidators,
  OrderFormValues,
} from 'client/modules/trading/types/orderFormTypes';
import { PRICE_TRIGGER_PLACE_ORDER_TYPES } from 'client/modules/trading/types/placeOrderTypes';
import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

interface Params {
  formError: OrderFormError | undefined;
  validators: OrderFormValidators;
  priceIncrement: BigNumber | undefined;
  decimalAdjustedSizeIncrement: BigNumber | undefined;
  minAssetOrderSize: BigNumber | undefined;
  inputConversionPrice: BigNumber | undefined;
  isPrimaryQuote: boolean | undefined;
}

export function useOrderFormInputs({
  formError,
  validators,
  priceIncrement,
  decimalAdjustedSizeIncrement,
  minAssetOrderSize,
  inputConversionPrice,
  isPrimaryQuote,
}: Params) {
  const form = useFormContext<OrderFormValues>();

  const { register, setValue, formState } = form;

  const [sizeDenom, amountFraction, sizeSource, orderType] = useWatch({
    control: form.control,
    name: ['sizeDenom', 'amountFraction', 'sizeSource', 'orderType'],
  });

  const showPriceInput = orderType === 'limit' || orderType === 'stop_limit';
  const showTriggerPriceInput =
    PRICE_TRIGGER_PLACE_ORDER_TYPES.includes(orderType);
  const showTwapOrderFormInputs = orderType === 'twap';
  const showScaledOrderFormInputs = orderType === 'multi_limit';

  const sizeErrorTooltipContent = useOrderFormSizeErrorTooltipContent({
    formError,
    decimalAdjustedSizeIncrement,
    minAssetOrderSize,
    sizeDenom,
    inputConversionPrice,
    isPrimaryQuote,
  });

  const priceErrorTooltipContent = useOrderFormLimitPriceErrorTooltipContent({
    formError,
    priceIncrement,
  });

  const triggerPriceErrorTooltipContent =
    useOrderFormTriggerPriceErrorTooltipContent({
      formError,
      priceIncrement,
    });

  const {
    sizeInputRegister,
    limitPriceInputRegister,
    triggerPriceInputRegister,
  } = useMemo(() => {
    return {
      sizeInputRegister: register('size', {
        validate: validators.size,
      }),
      limitPriceInputRegister: register('limitPrice', {
        validate: validators.limitPrice,
      }),
      triggerPriceInputRegister: register('triggerPrice', {
        validate: validators.triggerPrice,
      }),
    };
  }, [register, validators]);

  // This fires only on direct change, not when `useForm` triggers a value change, so this is safe to do
  const onFractionChange = useCallback(
    (fractionAmount: number) => {
      if (sizeSource !== 'fraction') {
        setValue('sizeSource', 'fraction');
      }
      setValue('amountFraction', fractionAmount);
    },
    [sizeSource, setValue],
  );

  const onSizeInputFocus = useCallback(() => {
    setValue('sizeSource', 'size');
  }, [setValue]);

  const setSizeDenom = useCallback(
    (denom: OrderFormSizeDenom) => {
      setValue('sizeDenom', denom);
    },
    [setValue],
  );

  return {
    sizeInputRegister,
    limitPriceInputRegister,
    triggerPriceInputRegister,
    amountFraction,
    errors: formState.errors,
    showPriceInput,
    showTriggerPriceInput,
    orderType,
    errorTooltips: {
      size: sizeErrorTooltipContent,
      price: priceErrorTooltipContent,
      triggerPrice: triggerPriceErrorTooltipContent,
    },
    onFractionChange,
    onSizeInputFocus,
    sizeDenom,
    setSizeDenom,
    showTwapOrderFormInputs,
    showScaledOrderFormInputs,
    setValue,
  };
}
