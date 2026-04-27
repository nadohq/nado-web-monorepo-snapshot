import { removeDecimals, toBigNumber } from '@nadohq/client';
import { calcPnl } from '@nadohq/react-client';
import {
  fractionValidator,
  InputValidatorFn,
  safeParseForData,
} from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { ClosePositionParams } from 'client/hooks/execute/placeOrder/useExecuteClosePosition';
import { useExecuteClosePositionWithNotification } from 'client/hooks/execute/placeOrder/useExecuteClosePositionWithNotification';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { usePerpPositions } from 'client/hooks/subaccount/usePerpPositions';
import { useLinkedAmountFractionInputEffects } from 'client/hooks/ui/form/useLinkedAmountFractionInputEffects';
import { useOnFractionSelectedHandler } from 'client/hooks/ui/form/useOnFractionSelectedHandler';
import {
  RUN_WITH_DELAY_DURATIONS,
  useRunWithDelayOnCondition,
} from 'client/hooks/util/useRunWithDelayOnCondition';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { ClosePositionFormErrorType } from 'client/modules/trading/closePosition/types';
import { isValidIncrementAmount } from 'client/modules/trading/utils/isValidIncrementAmount';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { LinkedAmountFractionFormValues } from 'client/types/linkedAmountFractionFormTypes';
import { watchFormError } from 'client/utils/form/watchFormError';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';
import { roundToIncrement } from 'client/utils/rounding';
import { useCallback, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';

interface Params extends Pick<
  ClosePositionParams,
  'productId' | 'isoSubaccountName'
> {
  isLimitOrder: boolean;
}

export interface ClosePositionFormValues extends LinkedAmountFractionFormValues {
  limitPrice: string;
}

export function useClosePositionForm({
  productId,
  isoSubaccountName,
  isLimitOrder,
}: Params) {
  const { hide } = useDialog();
  const { closePositionWithNotification, isPending, isSuccess } =
    useExecuteClosePositionWithNotification();
  const { data: positionsData } = usePerpPositions();
  const { data: staticMarketsData } = useAllMarketsStaticData();

  const perpPositionItem = positionsData?.find((position) => {
    const matchesProductId = position.productId === productId;
    const matchesMarginMode =
      position.iso?.subaccountName === isoSubaccountName;

    return matchesProductId && matchesMarginMode;
  });

  const form = useForm<ClosePositionFormValues>({
    defaultValues: {
      amount: '',
      amountSource: 'fraction',
      /** Defaults to 100% */
      amountFraction: 1,
      limitPrice: '',
    },
    mode: 'onTouched',
  });

  const { register, setValue, handleSubmit } = form;

  const [amountInput, limitPriceInput, amountFractionInput] = useWatch({
    control: form.control,
    name: ['amount', 'limitPrice', 'amountFraction'],
  });

  const validAmount = useMemo(() => {
    return safeParseForData(positiveBigNumberValidator, amountInput);
  }, [amountInput]);

  const validPrice = useMemo(() => {
    return safeParseForData(positiveBigNumberValidator, limitPriceInput);
  }, [limitPriceInput]);

  const validAmountFraction = useMemo(() => {
    return safeParseForData(fractionValidator, amountFractionInput);
  }, [amountFractionInput]);

  const marketData = staticMarketsData?.perpMarkets[productId];

  const { decimalAdjustedMinSize, decimalAdjustedSizeIncrement } =
    useMemo(() => {
      return {
        decimalAdjustedMinSize: removeDecimals(marketData?.minSize),
        decimalAdjustedSizeIncrement: removeDecimals(marketData?.sizeIncrement),
      };
    }, [marketData]);
  const priceIncrement = marketData?.priceIncrement;

  const minAssetOrderSize = useMemo(() => {
    if (!isLimitOrder) {
      return decimalAdjustedSizeIncrement;
    }

    if (!decimalAdjustedMinSize || !validPrice) {
      return;
    }

    const minAssetSize = decimalAdjustedMinSize.div(validPrice);

    return roundToIncrement(
      minAssetSize,
      decimalAdjustedSizeIncrement,
      BigNumber.ROUND_UP,
    );
  }, [
    isLimitOrder,
    validPrice,
    decimalAdjustedSizeIncrement,
    decimalAdjustedMinSize,
  ]);

  const amountInputError: ClosePositionFormErrorType | undefined =
    watchFormError(form, 'amount');

  const limitPriceInputError: ClosePositionFormErrorType | undefined =
    watchFormError(form, 'limitPrice');

  const formError: ClosePositionFormErrorType | undefined = (() => {
    if (!!amountInputError) {
      return amountInputError;
    }

    if (isLimitOrder && !!limitPriceInputError) {
      return limitPriceInputError;
    }

    return undefined;
  })();

  const validateAmount = useCallback<
    InputValidatorFn<string, ClosePositionFormErrorType>
  >(
    (val) => {
      if (!val || !val.trim()) {
        return;
      }

      const parsed = positiveBigNumberValidator.safeParse(val);
      if (!parsed.success) {
        return 'invalid_amount_input';
      }

      if (perpPositionItem?.amount.abs().lt(val)) {
        return 'max_exceeded';
      }

      if (minAssetOrderSize?.gt(val)) {
        return 'below_min';
      }

      if (
        decimalAdjustedSizeIncrement &&
        !isValidIncrementAmount(val, decimalAdjustedSizeIncrement)
      ) {
        return 'invalid_size_increment';
      }

      return undefined;
    },
    [perpPositionItem?.amount, minAssetOrderSize, decimalAdjustedSizeIncrement],
  );

  const validatePrice = useCallback<
    InputValidatorFn<string, ClosePositionFormErrorType>
  >(
    (val) => {
      if (!val || !val.trim()) {
        return;
      }

      const parsed = positiveBigNumberValidator.safeParse(val);
      if (!parsed.success) {
        return 'invalid_price_input';
      } else if (priceIncrement) {
        if (!isValidIncrementAmount(val, priceIncrement)) {
          return 'invalid_price_increment';
        }
      }
    },
    [priceIncrement],
  );

  const { amountInputRegister, limitPriceInputRegister } = useMemo(() => {
    return {
      amountInputRegister: register('amount', {
        validate: validateAmount,
      }),
      limitPriceInputRegister: register('limitPrice', {
        validate: validatePrice,
      }),
    };
  }, [register, validatePrice, validateAmount]);

  const amountRealizedPnl = useMemo(() => {
    if (!validAmountFraction || !validAmount || !perpPositionItem) return;

    // For market orders, we can just use the position's displayed PnL
    if (!isLimitOrder) {
      return perpPositionItem.estimatedPnlUsd?.multipliedBy(
        validAmountFraction,
      );
    }

    // Note: validAmount and averageEntryPrice are both positive, so this assumes a long
    const netEntryCost =
      perpPositionItem.price.averageEntryPrice?.times(validAmount);

    return netEntryCost && validPrice
      ? // Invert the PnL for shorts
        calcPnl(validAmount, validPrice, netEntryCost).times(
          perpPositionItem.amount.isPositive() ? 1 : -1,
        )
      : undefined;
  }, [
    validAmountFraction,
    validAmount,
    perpPositionItem,
    isLimitOrder,
    validPrice,
  ]);

  useRunWithDelayOnCondition({
    condition: isSuccess,
    fn: hide,
    delay: RUN_WITH_DELAY_DURATIONS.SHORT,
  });

  useLinkedAmountFractionInputEffects({
    form,
    validAmount,
    validAmountFraction,
    maxAmount: perpPositionItem?.amount.abs(),
    amountIncrement: decimalAdjustedSizeIncrement,
  });

  const isClosingFullPosition = validAmountFraction === 1;

  // Action Button State
  const buttonState = useMemo((): BaseActionButtonState => {
    if (isPending) {
      return 'loading';
    } else if (isSuccess) {
      return 'success';
    } else if (!validAmount || (isLimitOrder && !validPrice) || !!formError) {
      return 'disabled';
    } else {
      return 'idle';
    }
  }, [isPending, isSuccess, formError, validAmount, isLimitOrder, validPrice]);

  const onFractionChange = useOnFractionSelectedHandler({
    setValue,
  });

  // Handle Close Position
  const onSubmit = useCallback(
    (values: ClosePositionFormValues) => {
      if (!perpPositionItem) {
        return;
      }

      const limitPrice = isLimitOrder
        ? toBigNumber(values.limitPrice)
        : undefined;

      closePositionWithNotification({
        productId,
        limitPrice,
        size: toBigNumber(values.amount).abs(),
        isoSubaccountName: perpPositionItem.iso?.subaccountName,
        fraction: values.amountFraction,
        positionAmount: perpPositionItem.amount,
        metadata: {
          ...perpPositionItem.metadata,
          priceIncrement,
          sizeIncrement: decimalAdjustedSizeIncrement,
        },
      });
    },
    [
      perpPositionItem,
      isLimitOrder,
      closePositionWithNotification,
      productId,
      priceIncrement,
      decimalAdjustedSizeIncrement,
    ],
  );

  return {
    perpPositionItem,
    isClosingFullPosition,
    amountInputError,
    limitPriceInputError,
    amountInputRegister,
    limitPriceInputRegister,
    amountFractionInput,
    minAssetOrderSize,
    amountRealizedPnl,
    formError,
    validAmount,
    buttonState,
    decimalAdjustedSizeIncrement,
    priceIncrement,
    setValue,
    onSubmit: handleSubmit(onSubmit),
    onFractionChange,
  };
}
