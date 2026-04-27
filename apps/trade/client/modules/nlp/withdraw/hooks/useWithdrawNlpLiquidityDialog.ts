import {
  addDecimals,
  BigNumbers,
  NLP_PRODUCT_ID,
  removeDecimals,
  toIntegerString,
} from '@nadohq/client';
import {
  AnnotatedSpotMarket,
  SEQUENCER_FEE_AMOUNT_USDT,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { fractionValidator, safeParseForData } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { useExecuteBurnNlp } from 'client/hooks/execute/useExecuteBurnNlp';
import { useMarket } from 'client/hooks/markets/useMarket';
import { useQueryMaxBurnNlpAmount } from 'client/hooks/query/nlp/useQueryMaxBurnNlpAmount';
import { useQueryNlpLockedBalances } from 'client/hooks/query/nlp/useQueryNlpLockedBalances';
import { useLinkedAmountFractionInputEffects } from 'client/hooks/ui/form/useLinkedAmountFractionInputEffects';
import { useOnFractionSelectedHandler } from 'client/hooks/ui/form/useOnFractionSelectedHandler';
import { useRunWithDelayOnCondition } from 'client/hooks/util/useRunWithDelayOnCondition';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { LinkedAmountFractionFormValues } from 'client/types/linkedAmountFractionFormTypes';
import { resolveAmountFractionSubmitValue } from 'client/utils/form/resolveAmountFractionSubmitValue';
import { watchFormError } from 'client/utils/form/watchFormError';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';
import { useCallback, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type WithdrawNlpLiquidityFormErrorType =
  | 'invalid_input'
  | 'max_exceeded';

export type WithdrawNlpLiquidityActionButtonState = BaseActionButtonState;

export type WithdrawNlpLiquidityFormValues = LinkedAmountFractionFormValues;

export function useWithdrawNlpLiquidityDialog() {
  const { t } = useTranslation();

  const { primaryQuoteToken } = useNadoMetadataContext();
  const { dispatchNotification } = useNotificationManagerContext();

  const { data: nlpLockedBalancesData } = useQueryNlpLockedBalances();
  const { data: nlpMarket } = useMarket<AnnotatedSpotMarket>({
    productId: NLP_PRODUCT_ID,
  });
  const { data: maxBurnNlpAmount } = useQueryMaxBurnNlpAmount();

  const decimalAdjustedNlpLockedBalanceAmount = removeDecimals(
    nlpLockedBalancesData?.balanceLocked.balance,
  );

  const decimalAdjustedMaxBurnNlpAmount = removeDecimals(maxBurnNlpAmount);

  // Form state
  const form = useForm<WithdrawNlpLiquidityFormValues>({
    defaultValues: {
      amount: '',
      amountSource: 'absolute',
      amountFraction: 0,
    },
    mode: 'onTouched',
  });

  // Watched & derived state
  const amountInput = useWatch({
    control: form.control,
    name: 'amount',
  });
  const validAmount = useMemo(() => {
    return safeParseForData(positiveBigNumberValidator, amountInput);
  }, [amountInput]);

  // Estimate fee from the input. There is a base sequencer fee and an additional NLP fee.
  // The NLP fee is calculated as:
  // quote_amount = nlp_to_burn * oracle_price
  // fee = min(quote_amount, max(1 USDT, quote_amount * 10 bps))
  const primaryQuoteFeeAmount = useMemo(() => {
    if (!validAmount || !nlpMarket) {
      return SEQUENCER_FEE_AMOUNT_USDT;
    }

    const quoteAmount = validAmount.multipliedBy(nlpMarket.product.oraclePrice);
    const nlpFee = BigNumber.min(
      quoteAmount,
      BigNumber.max(BigNumbers.ONE, quoteAmount.multipliedBy(0.001)),
    );

    return nlpFee.plus(SEQUENCER_FEE_AMOUNT_USDT);
  }, [validAmount, nlpMarket]);

  // Use oracle price to estimate the amount of USDT returned
  const estimatedPrimaryQuoteAmount = useMemo(() => {
    if (!validAmount || !nlpMarket) {
      return;
    }

    return validAmount
      .multipliedBy(nlpMarket.product.oraclePrice)
      .minus(primaryQuoteFeeAmount);
  }, [primaryQuoteFeeAmount, validAmount, nlpMarket]);

  const amountInputError: WithdrawNlpLiquidityFormErrorType | undefined =
    watchFormError(form, 'amount');

  const amountFractionInput = useWatch({
    control: form.control,
    name: 'amountFraction',
  });
  const validAmountFraction = useMemo(() => {
    return safeParseForData(fractionValidator, amountFractionInput);
  }, [amountFractionInput]);

  // Linked fraction / amount inputs
  useLinkedAmountFractionInputEffects({
    validAmountFraction,
    validAmount,
    maxAmount: decimalAdjustedMaxBurnNlpAmount,
    form,
  });

  // Validation for inputs
  const validateAmount = useCallback(
    (input: string): WithdrawNlpLiquidityFormErrorType | undefined => {
      if (!input) {
        return;
      }

      const parsedInput = safeParseForData(positiveBigNumberValidator, input);
      if (!parsedInput) {
        return 'invalid_input';
      }
      if (
        decimalAdjustedMaxBurnNlpAmount &&
        parsedInput.gt(decimalAdjustedMaxBurnNlpAmount)
      ) {
        return 'max_exceeded';
      }
    },
    [decimalAdjustedMaxBurnNlpAmount],
  );

  // Handlers
  const onFractionSelected = useOnFractionSelectedHandler({
    setValue: form.setValue,
  });

  // Burn mutation
  const executeBurnNlp = useExecuteBurnNlp();
  const mutateBurnNlpAsync = executeBurnNlp.mutateAsync;

  useRunWithDelayOnCondition({
    condition: executeBurnNlp.isSuccess,
    fn: executeBurnNlp.reset,
  });

  const onSubmitForm = useCallback(
    (values: WithdrawNlpLiquidityFormValues) => {
      const amount = resolveAmountFractionSubmitValue(
        values,
        decimalAdjustedMaxBurnNlpAmount,
      );

      if (amount.isZero()) {
        console.warn('[useWithdrawNlpLiquidityDialog] Amount input is zero');
        return;
      }

      const amountWithDecimals = toIntegerString(addDecimals(amount));

      const serverExecutionResult = mutateBurnNlpAsync(
        {
          nlpAmount: amountWithDecimals,
        },
        {
          onSuccess: () => {
            form.resetField('amount');
            form.setValue('amountFraction', 0);
          },
        },
      );

      dispatchNotification({
        type: 'action_error_handler',
        data: {
          errorNotificationTitle: t(($) => $.errors.withdrawNlpFailed),
          executionData: { serverExecutionResult },
        },
      });
    },
    [
      decimalAdjustedMaxBurnNlpAmount,
      mutateBurnNlpAsync,
      dispatchNotification,
      form,
      t,
    ],
  );

  // Global form error state
  const formError: WithdrawNlpLiquidityFormErrorType | undefined =
    amountInputError;

  // Action button state
  const buttonState = useMemo((): WithdrawNlpLiquidityActionButtonState => {
    if (executeBurnNlp.isPending) {
      return 'loading';
    }
    if (executeBurnNlp.isSuccess) {
      return 'success';
    }
    if (!amountInput || formError) {
      return 'disabled';
    }
    return 'idle';
  }, [
    executeBurnNlp.isPending,
    executeBurnNlp.isSuccess,
    amountInput,
    formError,
  ]);

  return {
    buttonState,
    estimatedPrimaryQuoteAmount,
    primaryQuoteFeeAmount,
    form,
    formError,
    onFractionSelected,
    onSubmit: form.handleSubmit(onSubmitForm),
    primaryQuoteToken,
    validAmountFraction,
    validateAmount,
    maxBurnNlpAmount: decimalAdjustedMaxBurnNlpAmount,
    nlpLockedBalanceAmount: decimalAdjustedNlpLockedBalanceAmount,
  };
}
