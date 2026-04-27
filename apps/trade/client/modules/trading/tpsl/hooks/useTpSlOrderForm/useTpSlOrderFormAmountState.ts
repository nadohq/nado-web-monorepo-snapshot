import { removeDecimals } from '@nadohq/client';
import {
  InputValidatorFn,
  fractionValidator,
  safeParseForData,
} from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { useLinkedAmountFractionInputEffects } from 'client/hooks/ui/form/useLinkedAmountFractionInputEffects';
import {
  TpSlOrderFormAmountErrorType,
  TpSlOrderFormAmountState,
  TpSlOrderFormValues,
} from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { isValidIncrementAmount } from 'client/modules/trading/utils/isValidIncrementAmount';
import { watchFormError } from 'client/utils/form/watchFormError';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';
import { roundToIncrement } from 'client/utils/rounding';
import { useCallback, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';

interface Params {
  form: UseFormReturn<TpSlOrderFormValues>;
  hasLimitOrder: boolean;
  positionAmount: BigNumber | undefined;
  minSizeWithDecimals: BigNumber | undefined;
  sizeIncrementWithDecimals: BigNumber | undefined;
  oraclePrice: BigNumber | undefined;
}

export function useTpSlOrderFormAmountState({
  form,
  hasLimitOrder,
  positionAmount,
  minSizeWithDecimals,
  sizeIncrementWithDecimals,
  oraclePrice,
}: Params): TpSlOrderFormAmountState {
  const { decimalAdjustedMinSize, decimalAdjustedSizeIncrement } =
    useMemo(() => {
      return {
        decimalAdjustedMinSize: removeDecimals(minSizeWithDecimals),
        decimalAdjustedSizeIncrement: removeDecimals(sizeIncrementWithDecimals),
      };
    }, [minSizeWithDecimals, sizeIncrementWithDecimals]);

  const minOrderSize = useMemo(() => {
    if (!hasLimitOrder) {
      return decimalAdjustedSizeIncrement;
    }

    if (!oraclePrice || !decimalAdjustedMinSize) {
      return undefined;
    }

    const minAssetSize = decimalAdjustedMinSize.div(oraclePrice);

    return roundToIncrement(
      minAssetSize,
      decimalAdjustedSizeIncrement,
      BigNumber.ROUND_UP,
    );
  }, [
    hasLimitOrder,
    decimalAdjustedMinSize,
    decimalAdjustedSizeIncrement,
    oraclePrice,
  ]);

  const positionAmountAbs = useMemo(() => {
    return positionAmount?.abs();
  }, [positionAmount]);

  // Watched amount fields
  const [amountInput, amountFractionInput, isPartialOrder] = useWatch({
    control: form.control,
    name: ['amount', 'amountFraction', 'isPartialOrder'],
  });

  const validAmount = useMemo(() => {
    return safeParseForData(positiveBigNumberValidator, amountInput);
  }, [amountInput]);
  const validAmountFraction = useMemo(() => {
    return safeParseForData(fractionValidator, amountFractionInput);
  }, [amountFractionInput]);

  useLinkedAmountFractionInputEffects({
    maxAmount: positionAmountAbs,
    validAmount,
    validAmountFraction,
    form,
    amountIncrement: decimalAdjustedSizeIncrement,
  });

  const amountValidator = useCallback<
    InputValidatorFn<string, TpSlOrderFormAmountErrorType>
  >(
    (amount) => {
      if (!amount) {
        return;
      }

      const parsedInput = safeParseForData(positiveBigNumberValidator, amount);

      if (!parsedInput) {
        return 'invalid_amount_input';
      }

      if (minOrderSize && parsedInput.lt(minOrderSize)) {
        return 'below_min';
      }
      if (
        decimalAdjustedSizeIncrement &&
        !isValidIncrementAmount(parsedInput, decimalAdjustedSizeIncrement)
      ) {
        return 'invalid_size_increment';
      }

      if (positionAmountAbs && parsedInput.gt(positionAmountAbs)) {
        return 'max_exceeded';
      }
    },
    [minOrderSize, positionAmountAbs, decimalAdjustedSizeIncrement],
  );

  const amountInputError: TpSlOrderFormAmountErrorType | undefined =
    watchFormError(form, 'amount');
  const amountFormError = isPartialOrder ? amountInputError : undefined;

  const hasRequiredValues = useMemo(() => {
    if (isPartialOrder) {
      return !!validAmount && !amountInputError;
    }
    // If not a partial order, we assume a full position amt, so the form is always valid
    return true;
  }, [amountInputError, isPartialOrder, validAmount]);

  return {
    validAmount,
    validAmountFraction,
    amountFractionInput,
    amountInputError,
    amountFormError,
    validateAmountInput: amountValidator,
    isPartialOrder,
    minOrderSize,
    maxOrderSize: positionAmountAbs,
    hasRequiredValues,
  };
}
