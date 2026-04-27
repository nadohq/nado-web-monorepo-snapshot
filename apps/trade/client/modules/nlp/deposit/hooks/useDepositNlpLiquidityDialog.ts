import {
  addDecimals,
  BigNumbers,
  NLP_PRODUCT_ID,
  removeDecimals,
  toBigNumber,
  toIntegerString,
} from '@nadohq/client';
import {
  AnnotatedSpotMarket,
  safeDiv,
  SEQUENCER_FEE_AMOUNT_USDT,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { fractionValidator, safeParseForData } from '@nadohq/web-common';
import { useExecuteMintNlp } from 'client/hooks/execute/useExecuteMintNlp';
import { useMarket } from 'client/hooks/markets/useMarket';
import { useQueryMaxMintNlpAmount } from 'client/hooks/query/subaccount/useQueryMaxMintNlpAmount';
import { useLinkedAmountFractionInputEffects } from 'client/hooks/ui/form/useLinkedAmountFractionInputEffects';
import { useOnFractionSelectedHandler } from 'client/hooks/ui/form/useOnFractionSelectedHandler';
import { useRunWithDelayOnCondition } from 'client/hooks/util/useRunWithDelayOnCondition';
import { NLP_MAX_DEPOSIT_CAP_USD } from 'client/modules/nlp/consts';
import { useAddressNlpState } from 'client/modules/nlp/hooks/useAddressNlpState';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { LinkedAmountFractionFormValues } from 'client/types/linkedAmountFractionFormTypes';
import { resolveAmountFractionSubmitValue } from 'client/utils/form/resolveAmountFractionSubmitValue';
import { watchFormError } from 'client/utils/form/watchFormError';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';
import { useCallback, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type DepositNlpLiquidityFormErrorType =
  | 'invalid_input'
  | 'max_exceeded'
  | 'below_min';

export type DepositNlpLiquidityActionButtonState = BaseActionButtonState;

export interface DepositNlpLiquidityFormValues extends LinkedAmountFractionFormValues {
  enableBorrows: boolean;
}

const NLP_LOCKUP_PERIOD_IN_DAYS = 4;

export function useDepositNlpLiquidityDialog() {
  const { t } = useTranslation();
  const { primaryQuoteToken } = useNadoMetadataContext();
  const { dispatchNotification } = useNotificationManagerContext();
  const { data: nlpMarket } = useMarket<AnnotatedSpotMarket>({
    productId: NLP_PRODUCT_ID,
  });

  // Form state
  const form = useForm<DepositNlpLiquidityFormValues>({
    defaultValues: {
      amount: '',
      amountSource: 'absolute',
      amountFraction: 0,
      enableBorrows: false,
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
  // Use oracle price to estimate the amount of NLP minted
  const estimatedNlpAmount = useMemo(() => {
    if (!validAmount || !nlpMarket) {
      return;
    }
    if (validAmount.lte(SEQUENCER_FEE_AMOUNT_USDT)) {
      return BigNumbers.ZERO;
    }

    return safeDiv(
      validAmount.minus(SEQUENCER_FEE_AMOUNT_USDT),
      nlpMarket.product.oraclePrice,
    );
  }, [validAmount, nlpMarket]);

  const amountInputError: DepositNlpLiquidityFormErrorType | undefined =
    watchFormError(form, 'amount');

  const amountFractionInput = useWatch({
    control: form.control,
    name: 'amountFraction',
  });
  const validAmountFraction = useMemo(() => {
    return safeParseForData(fractionValidator, amountFractionInput);
  }, [amountFractionInput]);

  const enableBorrows = useWatch({
    control: form.control,
    name: 'enableBorrows',
  });

  // Get user's current NLP balance in USD
  const { balanceValueUsd } = useAddressNlpState();

  // Max amounts
  const { data: maxMintNlpAmount } = useQueryMaxMintNlpAmount({
    spotLeverage: enableBorrows,
  });

  // Max amount excludes the sequencer fee, but input should include the fee
  const decimalAdjustedMaxQuoteAmountWithFee = useMemo(() => {
    if (!maxMintNlpAmount) {
      return;
    }
    if (maxMintNlpAmount.isZero()) {
      return BigNumbers.ZERO;
    }

    return removeDecimals(maxMintNlpAmount).plus(SEQUENCER_FEE_AMOUNT_USDT);
  }, [maxMintNlpAmount]);

  // Max deposit is 20,000 - current NLP value
  const maxDepositAmountUsd = useMemo(() => {
    if (balanceValueUsd === undefined) {
      return undefined;
    }

    const capBigNumber = toBigNumber(NLP_MAX_DEPOSIT_CAP_USD);
    const remainingCapacity = capBigNumber.minus(balanceValueUsd);

    if (remainingCapacity.lte(0)) {
      return BigNumbers.ZERO;
    }

    return remainingCapacity;
  }, [balanceValueUsd]);

  // Linked fraction / amount inputs
  useLinkedAmountFractionInputEffects({
    validAmountFraction,
    validAmount,
    maxAmount: decimalAdjustedMaxQuoteAmountWithFee,
    form,
  });

  // Validation for inputs
  const validateAmount = useCallback(
    (input: string): DepositNlpLiquidityFormErrorType | undefined => {
      if (!input) {
        return;
      }

      const parsedInput = safeParseForData(positiveBigNumberValidator, input);
      if (!parsedInput) {
        return 'invalid_input';
      }
      if (parsedInput.lte(SEQUENCER_FEE_AMOUNT_USDT)) {
        return 'below_min';
      }
      if (
        decimalAdjustedMaxQuoteAmountWithFee &&
        parsedInput.gt(decimalAdjustedMaxQuoteAmountWithFee)
      ) {
        return 'max_exceeded';
      }
    },
    [decimalAdjustedMaxQuoteAmountWithFee],
  );

  // Handlers
  const onFractionSelected = useOnFractionSelectedHandler({
    setValue: form.setValue,
  });
  const onEnableBorrowsChange = (enabled: boolean) => {
    form.setValue('enableBorrows', enabled);
  };

  // Mint mutation
  const executeMintNlp = useExecuteMintNlp();
  const mutateMintNlpAsync = executeMintNlp.mutateAsync;

  useRunWithDelayOnCondition({
    condition: executeMintNlp.isSuccess,
    fn: executeMintNlp.reset,
  });

  const onSubmitForm = useCallback(
    (values: DepositNlpLiquidityFormValues) => {
      const amount = resolveAmountFractionSubmitValue(
        values,
        decimalAdjustedMaxQuoteAmountWithFee,
      );

      const amountWithoutFee = amount.minus(SEQUENCER_FEE_AMOUNT_USDT);

      if (amountWithoutFee.lte(0)) {
        console.warn(
          '[useDepositNlpLiquidityDialog] Invalid quote amount',
          amountWithoutFee.toString(),
        );
        return;
      }

      const amountWithDecimals = toIntegerString(addDecimals(amountWithoutFee));

      const serverExecutionResult = mutateMintNlpAsync(
        {
          quoteAmount: amountWithDecimals,
          spotLeverage: values.enableBorrows,
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
          errorNotificationTitle: t(($) => $.errors.depositNlpFailed),
          executionData: { serverExecutionResult },
        },
      });
    },
    [
      decimalAdjustedMaxQuoteAmountWithFee,
      mutateMintNlpAsync,
      dispatchNotification,
      form,
      t,
    ],
  );

  // Global form error state
  const formError: DepositNlpLiquidityFormErrorType | undefined =
    amountInputError;

  // Action button state
  const buttonState = useMemo((): DepositNlpLiquidityActionButtonState => {
    if (executeMintNlp.isPending) {
      return 'loading';
    }
    if (executeMintNlp.isSuccess) {
      return 'success';
    }
    if (!amountInput || formError) {
      return 'disabled';
    }
    return 'idle';
  }, [
    executeMintNlp.isPending,
    executeMintNlp.isSuccess,
    amountInput,
    formError,
  ]);

  return {
    buttonState,
    estimatedNlpAmount,
    form,
    formError,
    onEnableBorrowsChange,
    onFractionSelected,
    onSubmit: form.handleSubmit(onSubmitForm),
    primaryQuoteToken,
    validAmountFraction,
    validateAmount,
    enableBorrows,
    decimalAdjustedMaxQuoteAmountWithFee,
    maxDepositAmountUsd,
    nlpLockupPeriodInDays: NLP_LOCKUP_PERIOD_IN_DAYS,
  };
}
