import { BalanceSide } from '@nadohq/client';
import { calcPnl } from '@nadohq/react-client';
import { InputValidatorFn, safeParseForData } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { getTpSlFormPriceValuesKey } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/getTpSlFormPriceValuesKey';
import {
  TpSlOrderFormLimitPriceErrorType,
  TpSlOrderFormPriceState,
  TpSlOrderFormTriggerPriceErrorType,
  TpSlOrderFormValues,
} from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { useTpSlOrderFormPriceOnChangeSideEffects } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/useTpSlOrderFormPriceOnChangeSideEffects';
import { useTpSlTriggerPriceValidator } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/useTpSlTriggerPriceValidator';
import { watchFormError } from 'client/utils/form/watchFormError';
import {
  finiteBigNumberValidator,
  positiveBigNumberValidator,
} from 'client/utils/inputValidators';
import { useCallback, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';

interface Params {
  form: UseFormReturn<TpSlOrderFormValues>;
  isTakeProfit: boolean;
  positionCloseAmount: BigNumber | undefined;
  positionCloseAmountNetEntry: BigNumber | undefined;
  positionCloseAmountNetCostForPnl: BigNumber | undefined;
  priceIncrement: BigNumber | undefined;
  prices: {
    last: BigNumber | undefined;
    oracle: BigNumber | undefined;
    mid: BigNumber | undefined;
  };
  referencePriceOverride: BigNumber | undefined;
}

/**
 * Hook to manage state of a Take Profit OR Stop Loss form. TP/SLs have individual
 * trigger / limit price inputs.
 */
export function useTpSlOrderFormPriceState({
  form,
  isTakeProfit,
  priceIncrement,
  positionCloseAmount,
  positionCloseAmountNetEntry,
  positionCloseAmountNetCostForPnl,
  prices,
  referencePriceOverride,
}: Params): TpSlOrderFormPriceState {
  const formPriceValuesKey = getTpSlFormPriceValuesKey(isTakeProfit);

  const [
    triggerReferencePriceType,
    triggerPrice,
    limitPrice,
    isLimitOrder,
    gainOrLossValue,
    triggerPriceSource,
    gainOrLossInputType,
  ] = useWatch({
    control: form.control,
    name: [
      `${formPriceValuesKey}.triggerReferencePriceType`,
      `${formPriceValuesKey}.triggerPrice`,
      `${formPriceValuesKey}.limitPrice`,
      `${formPriceValuesKey}.isLimitOrder`,
      `${formPriceValuesKey}.gainOrLossValue`,
      `${formPriceValuesKey}.triggerPriceSource`,
      `${formPriceValuesKey}.gainOrLossInputType`,
    ],
  });

  // Watched errors
  const limitPriceError: TpSlOrderFormLimitPriceErrorType | undefined =
    watchFormError(form, `${formPriceValuesKey}.limitPrice`);
  const triggerPriceError: TpSlOrderFormTriggerPriceErrorType | undefined =
    watchFormError(form, `${formPriceValuesKey}.triggerPrice`);

  // Validated fields
  const validTriggerPrice = useMemo(() => {
    return safeParseForData(positiveBigNumberValidator, triggerPrice);
  }, [triggerPrice]);
  const validGainOrLossValue = useMemo(() => {
    return safeParseForData(finiteBigNumberValidator, gainOrLossValue);
  }, [gainOrLossValue]);
  const validLimitPrice = useMemo(() => {
    return safeParseForData(positiveBigNumberValidator, limitPrice);
  }, [limitPrice]);

  const referencePrice = (() => {
    if (referencePriceOverride) {
      return referencePriceOverride;
    }
    switch (triggerReferencePriceType) {
      case 'oracle_price':
        return prices.oracle;
      case 'last_price':
        return prices.last;
      case 'mid_price':
        return prices.mid;
    }
  })();

  const positionSide: BalanceSide | undefined = (() => {
    if (!positionCloseAmount || positionCloseAmount.isZero()) {
      return undefined;
    }
    return positionCloseAmount.isPositive() ? 'long' : 'short';
  })();

  const isTriggerPriceAbove =
    positionSide === 'long' ? isTakeProfit : !isTakeProfit;

  // Validators
  const validateTriggerPrice = useTpSlTriggerPriceValidator({
    isTakeProfit,
    positionSide,
    referencePrice,
  });
  const validateLimitPrice = useCallback<
    InputValidatorFn<string, TpSlOrderFormLimitPriceErrorType>
  >((limitPrice) => {
    if (!limitPrice) {
      return;
    }

    const parsedTriggerPrice = safeParseForData(
      positiveBigNumberValidator,
      limitPrice,
    );

    if (!parsedTriggerPrice) {
      return 'invalid_limit_price_input';
    }
  }, []);

  // Change effects
  useTpSlOrderFormPriceOnChangeSideEffects({
    form,
    gainOrLossInputType,
    isTakeProfit,
    positionCloseAmount,
    positionCloseAmountNetEntry,
    positionCloseAmountNetCostForPnl,
    priceIncrement,
    triggerPriceSource,
    validGainOrLossValue,
    validTriggerPrice,
  });

  // Derived state
  const formError = useMemo(() => {
    if (triggerPriceError) {
      return triggerPriceError;
    }

    if (isLimitOrder && limitPriceError) {
      return limitPriceError;
    }
    // When `limit` is enabled, we need to propagate a form error so that the submit button is disabled when there isn't a valid limit price input
    if (isLimitOrder && !validLimitPrice) {
      return 'invalid_limit_price_input';
    }
  }, [isLimitOrder, limitPriceError, triggerPriceError, validLimitPrice]);

  const hasRequiredValues = useMemo(() => {
    if (formError || !validTriggerPrice) {
      return false;
    }
    if (isLimitOrder && !validLimitPrice) {
      return false;
    }
    return true;
  }, [formError, isLimitOrder, validLimitPrice, validTriggerPrice]);

  const clearInputs = useCallback(() => {
    // Using `setValue` to ensure all fields are completely reset instead of being reset to initial values.
    form.setValue(`${formPriceValuesKey}.triggerPrice`, '');
    form.setValue(`${formPriceValuesKey}.gainOrLossValue`, '');
    form.setValue(`${formPriceValuesKey}.limitPrice`, '');
  }, [form, formPriceValuesKey]);

  // Form estimated state
  // Use limit price for PnL estimation when limit order is checked, otherwise use trigger price
  const executionPriceForPnl = isLimitOrder
    ? validLimitPrice
    : validTriggerPrice;

  const estimatedPnlUsd = useMemo(() => {
    if (
      !positionCloseAmount ||
      !positionCloseAmountNetEntry ||
      !executionPriceForPnl
    ) {
      return;
    }

    return calcPnl(
      positionCloseAmount,
      executionPriceForPnl,
      positionCloseAmountNetEntry,
    );
  }, [positionCloseAmount, positionCloseAmountNetEntry, executionPriceForPnl]);
  const estimatedPnlFrac = useMemo(() => {
    if (!estimatedPnlUsd || !positionCloseAmountNetCostForPnl) {
      return;
    }

    return estimatedPnlUsd.dividedBy(positionCloseAmountNetCostForPnl);
  }, [estimatedPnlUsd, positionCloseAmountNetCostForPnl]);

  return {
    estimatedPnlUsd,
    estimatedPnlFrac,
    isTriggerPriceAbove,
    referencePrice,
    triggerPriceError,
    limitPriceError,
    validateLimitPrice,
    validateTriggerPrice,
    formError,
    isLimitOrder,
    isTakeProfit,
    triggerReferencePriceType,
    formPriceValuesKey,
    clearInputs,
    validTriggerPrice,
    hasRequiredValues,
  };
}
