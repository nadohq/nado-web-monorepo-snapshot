import { BigNumbers, QUOTE_PRODUCT_ID, removeDecimals } from '@nadohq/client';
import {
  useNadoMetadataContext,
  useSubaccountContext,
} from '@nadohq/react-client';
import { fractionValidator, safeParseForData } from '@nadohq/web-common';
import { ISO_MARGIN_TRANSFER_FEE_AMOUNT_USDT } from 'client/consts/isoMarginTransferFee';
import { useExecuteSubaccountQuoteTransfer } from 'client/hooks/execute/useExecuteSubaccountQuoteTransfer';
import { useQueryMaxWithdrawableAmount } from 'client/hooks/query/subaccount/useQueryMaxWithdrawableAmount';
import { useLinkedAmountFractionInputEffects } from 'client/hooks/ui/form/useLinkedAmountFractionInputEffects';
import {
  RUN_WITH_DELAY_DURATIONS,
  useRunWithDelayOnCondition,
} from 'client/hooks/util/useRunWithDelayOnCondition';
import {
  IsolatedAdjustMarginFormErrorType,
  IsolatedAdjustMarginFormValues,
} from 'client/modules/trading/hooks/useIsolatedAdjustMarginForm/types';
import { useIsolatedAdjustMarginAmountValidator } from 'client/modules/trading/hooks/useIsolatedAdjustMarginForm/useIsolatedAdjustMarginAmountValidator';
import { useIsolatedAdjustMarginFormHandlers } from 'client/modules/trading/hooks/useIsolatedAdjustMarginForm/useIsolatedAdjustMarginFormHandlers';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { watchFormError } from 'client/utils/form/watchFormError';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';
import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';

export function useIsolatedAdjustMarginForm({
  isoSubaccountName,
}: {
  isoSubaccountName: string;
}) {
  const { primaryQuoteToken } = useNadoMetadataContext();
  const { currentSubaccount } = useSubaccountContext();

  const currentSubaccountName = currentSubaccount.name;

  // Form state
  const useIsolatedAdjustMarginForm = useForm<IsolatedAdjustMarginFormValues>({
    defaultValues: {
      amount: '',
      adjustmentMode: 'add',
      amountSource: 'absolute',
      enableBorrows: false,
      amountFraction: 0,
    },
    mode: 'onTouched',
  });

  // Watched state
  const [adjustmentMode, amount, amountFractionInput, enableBorrows] = useWatch(
    {
      control: useIsolatedAdjustMarginForm.control,
      name: ['adjustmentMode', 'amount', 'amountFraction', 'enableBorrows'],
    },
  );

  const amountInput = amount.trim();

  const isAddMargin = adjustmentMode === 'add';

  // Max withdrawable
  const { data: maxWithdrawable } = useQueryMaxWithdrawableAmount({
    productId: QUOTE_PRODUCT_ID,
    spotLeverage: enableBorrows && isAddMargin,
    subaccountName: isAddMargin ? undefined : isoSubaccountName,
  });

  const decimalAdjustedMaxWithdrawableWithFee = useMemo(() => {
    if (!maxWithdrawable) {
      return;
    }

    if (maxWithdrawable.isZero()) {
      return BigNumbers.ZERO;
    }

    return removeDecimals(maxWithdrawable).plus(
      ISO_MARGIN_TRANSFER_FEE_AMOUNT_USDT,
    );
  }, [maxWithdrawable]);

  // Amount input
  const validAmount = useMemo(() => {
    return safeParseForData(positiveBigNumberValidator, amountInput);
  }, [amountInput]);

  const validAmountFraction = useMemo(() => {
    return safeParseForData(fractionValidator, amountFractionInput);
  }, [amountFractionInput]);

  const validateAmount = useIsolatedAdjustMarginAmountValidator({
    maxWithdrawable: decimalAdjustedMaxWithdrawableWithFee,
    isAddMargin,
  });

  const amountInputError: IsolatedAdjustMarginFormErrorType | undefined =
    watchFormError(useIsolatedAdjustMarginForm, 'amount');

  useLinkedAmountFractionInputEffects({
    validAmount,
    validAmountFraction,
    maxAmount: decimalAdjustedMaxWithdrawableWithFee,
    form: useIsolatedAdjustMarginForm,
  });

  // Subaccounts for the transfer
  const subaccounts = {
    recipient: isAddMargin ? isoSubaccountName : currentSubaccountName,
    sender: isAddMargin ? currentSubaccountName : isoSubaccountName,
  };

  // Execute transfer
  const executeSubaccountQuoteTransfer = useExecuteSubaccountQuoteTransfer();
  const { reset: resetMutationState } = executeSubaccountQuoteTransfer;

  useRunWithDelayOnCondition({
    condition: executeSubaccountQuoteTransfer.isSuccess,
    fn: resetMutationState,
    delay: RUN_WITH_DELAY_DURATIONS.LONG,
  });

  const {
    onEnableBorrowsChange,
    onMaxAmountClicked,
    onSubmitForm,
    onAdjustmentModeChange,
    onFractionSelected,
  } = useIsolatedAdjustMarginFormHandlers({
    form: useIsolatedAdjustMarginForm,
    executeFn: executeSubaccountQuoteTransfer,
    validAmount,
    subaccounts,
  });

  // Action button state
  const buttonState = useMemo((): BaseActionButtonState => {
    if (executeSubaccountQuoteTransfer.isPending) {
      return 'loading';
    }
    if (executeSubaccountQuoteTransfer.isSuccess) {
      return 'success';
    }
    if (!amountInput || amountInputError) {
      return 'disabled';
    }
    return 'idle';
  }, [
    amountInputError,
    amountInput,
    executeSubaccountQuoteTransfer.isPending,
    executeSubaccountQuoteTransfer.isSuccess,
  ]);

  // Reset amount related inputs when `enableBorrows` or `adjustmentMode` changes.
  useEffect(() => {
    useIsolatedAdjustMarginForm.resetField('amount');
    onFractionSelected(0);
  }, [
    enableBorrows,
    useIsolatedAdjustMarginForm,
    adjustmentMode,
    onFractionSelected,
  ]);

  // Reset mutation status when the `adjustmentMode` changes.
  useEffect(() => {
    resetMutationState();
  }, [adjustmentMode, resetMutationState]);

  return {
    form: useIsolatedAdjustMarginForm,
    formError: amountInputError,
    validAmount,
    validAmountFraction,
    buttonState,
    maxWithdrawable: decimalAdjustedMaxWithdrawableWithFee,
    enableBorrows,
    primaryQuoteToken,
    isAddMargin,
    onAdjustmentModeChange,
    onEnableBorrowsChange,
    onFractionSelected,
    validateAmount,
    onMaxAmountClicked,
    onSubmit: useIsolatedAdjustMarginForm.handleSubmit(onSubmitForm),
  };
}
