import {
  addDecimals,
  BigNumbers,
  QUOTE_PRODUCT_ID,
  removeDecimals,
  SubaccountTx,
  toBigNumber,
} from '@nadohq/client';
import {
  fractionValidator,
  InputValidatorFn,
  safeParseForData,
} from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { useExecuteWithdrawCollateral } from 'client/hooks/execute/useExecuteWithdrawCollateral';
import { useQueryMaxWithdrawableAmount } from 'client/hooks/query/subaccount/useQueryMaxWithdrawableAmount';
import { useLinkedAmountFractionInputEffects } from 'client/hooks/ui/form/useLinkedAmountFractionInputEffects';
import {
  OnFractionSelectedHandler,
  useOnFractionSelectedHandler,
} from 'client/hooks/ui/form/useOnFractionSelectedHandler';
import { useIsSmartContractWalletConnected } from 'client/hooks/util/useIsSmartContractWalletConnected';
import {
  RUN_WITH_DELAY_DURATIONS,
  useRunWithDelayOnCondition,
} from 'client/hooks/util/useRunWithDelayOnCondition';
import { useWithdrawalsAreDelayed } from 'client/modules/collateral/hooks/useWithdrawalsAreDelayed';
import { useWithdrawFormData } from 'client/modules/collateral/withdraw/hooks/useWithdrawFormData';
import {
  WithdrawErrorType,
  WithdrawFormValues,
  WithdrawProductSelectValue,
} from 'client/modules/collateral/withdraw/types';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { useIsSingleSignatureSession } from 'client/modules/singleSignatureSessions/hooks/useIsSingleSignatureSession';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { resolveAmountFractionSubmitValue } from 'client/utils/form/resolveAmountFractionSubmitValue';
import { watchFormError } from 'client/utils/form/watchFormError';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';
import { roundToString } from 'client/utils/rounding';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm, UseFormReturn, useWatch } from 'react-hook-form';

interface UseWithdrawForm {
  // Form errors indicate when to show an input error state
  form: UseFormReturn<WithdrawFormValues>;
  // Error for the info box
  formError: WithdrawErrorType | undefined;
  // $ Value for amount input
  amountInputValueUsd: BigNumber | undefined;
  validAmountFraction: number | undefined;
  availableProducts: WithdrawProductSelectValue[];
  withdrawMutation: ReturnType<typeof useExecuteWithdrawCollateral>;
  showGasWarning: boolean;
  showOneClickTradingPrompt: boolean;
  selectedProduct: WithdrawProductSelectValue | undefined;
  selectedProductMaxWithdrawable: BigNumber | undefined;
  buttonState: BaseActionButtonState;
  estimateStateTxs: SubaccountTx[];
  enableBorrows: boolean;
  suggestBorrowing: boolean;
  validateAmount: InputValidatorFn<string, WithdrawErrorType>;
  onFractionSelected: OnFractionSelectedHandler;
  onMaxAmountSelected: () => void;
  onEnableBorrowsChange: (enabled: boolean) => void;
  onSubmit: () => void;
}

export function useWithdrawForm({
  defaultEnableBorrows,
  initialProductId,
}: {
  defaultEnableBorrows: boolean;
  initialProductId: number | undefined;
}): UseWithdrawForm {
  const { dispatchNotification } = useNotificationManagerContext();
  const areWithdrawalsDelayed = useWithdrawalsAreDelayed();

  const isSmartContractWallet = useIsSmartContractWalletConnected();
  const isSingleSignature = useIsSingleSignatureSession({
    requireActive: true,
  });
  const showOneClickTradingPrompt = Boolean(
    isSmartContractWallet && !isSingleSignature,
  );

  const executeWithdrawCollateral = useExecuteWithdrawCollateral();

  useRunWithDelayOnCondition({
    condition: executeWithdrawCollateral.isSuccess,
    fn: executeWithdrawCollateral.reset,
    delay: RUN_WITH_DELAY_DURATIONS.LONG,
  });

  // Form state
  const useWithdrawForm = useForm<WithdrawFormValues>({
    defaultValues: {
      productId: initialProductId ?? QUOTE_PRODUCT_ID,
      amount: '',
      amountSource: 'absolute',
      enableBorrows: defaultEnableBorrows,
    },
    mode: 'onTouched',
  });

  // Watched inputs
  const [amountFractionInput, withdrawAmount, productIdInput, enableBorrows] =
    useWatch({
      control: useWithdrawForm.control,
      name: ['amountFraction', 'amount', 'productId', 'enableBorrows'],
    });

  const withdrawAmountInput = withdrawAmount.trim();

  const amountInputError: WithdrawErrorType | undefined = watchFormError(
    useWithdrawForm,
    'amount',
  );

  const { availableProducts, selectedProduct } = useWithdrawFormData({
    productIdInput,
  });

  // Max withdrawable
  const { data: maxWithdrawable } = useQueryMaxWithdrawableAmount({
    productId: selectedProduct?.productId,
    spotLeverage: enableBorrows,
  });
  const decimalAdjustedMaxWithdrawableWithFee = useMemo(() => {
    if (!maxWithdrawable || !selectedProduct) {
      return;
    }
    if (maxWithdrawable.isZero()) {
      return BigNumbers.ZERO;
    }
    // Backend returns max withdrawable exclusive of fee
    // The frontend input is the amount withdrawn inclusive of fee, so we need to add the fee to the backend data
    return removeDecimals(maxWithdrawable).plus(selectedProduct.fee.amount);
  }, [maxWithdrawable, selectedProduct]);

  // Util derived data
  const minInput = selectedProduct?.fee?.amount ?? BigNumbers.ZERO;
  const maxInput = decimalAdjustedMaxWithdrawableWithFee ?? BigNumbers.ZERO;

  // Parsed Amounts
  const validAmount = useMemo((): BigNumber | undefined => {
    return safeParseForData(positiveBigNumberValidator, withdrawAmountInput);
  }, [withdrawAmountInput]);

  const validAmountFraction = useMemo(() => {
    return safeParseForData(fractionValidator, amountFractionInput);
  }, [amountFractionInput]);

  // Reset form on borrow toggle or product ID change
  useEffect(
    () => {
      useWithdrawForm.resetField('amount');
      useWithdrawForm.setValue('amountFraction', 0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productIdInput, enableBorrows],
  );

  // Linked inputs for amount & fraction
  useLinkedAmountFractionInputEffects({
    validAmount,
    validAmountFraction,
    maxAmount: maxInput,
    form: useWithdrawForm,
  });

  // Validation for inputs
  const validateAmount = useCallback(
    (input: string): WithdrawErrorType | undefined => {
      if (selectedProduct == null || !input) {
        return;
      }
      const positiveBigNumberValidation =
        positiveBigNumberValidator.safeParse(input);
      // Check valid input first
      if (!positiveBigNumberValidation.success) {
        return 'invalid_input';
      }

      const parsedInput = positiveBigNumberValidation.data;

      // Check min
      if (toBigNumber(parsedInput).lte(minInput)) {
        return 'below_min';
      }
      // Then check max
      if (toBigNumber(parsedInput).gt(maxInput)) {
        return 'max_exceeded';
      }
    },
    [maxInput, minInput, selectedProduct],
  );

  // Global form error state
  const formError: WithdrawErrorType | undefined = useMemo(() => {
    // Trigger the other validations only after user has interacted with the form,
    if (selectedProduct == null) {
      return;
    }

    return amountInputError;
  }, [selectedProduct, amountInputError]);

  const onFractionSelected = useOnFractionSelectedHandler({
    setValue: useWithdrawForm.setValue,
  });

  const onEnableBorrowsChange = (enabled: boolean) => {
    useWithdrawForm.setValue('enableBorrows', enabled);
  };

  // Button state
  const buttonState = useMemo((): BaseActionButtonState => {
    if (executeWithdrawCollateral.isPending) {
      return 'loading';
    } else if (executeWithdrawCollateral.isSuccess) {
      return 'success';
    } else if (!withdrawAmountInput || !selectedProduct || formError) {
      return 'disabled';
    } else {
      return 'idle';
    }
  }, [
    executeWithdrawCollateral.isPending,
    executeWithdrawCollateral.isSuccess,
    withdrawAmountInput,
    selectedProduct,
    formError,
  ]);

  // Formatted deltas for the selected product
  const estimateStateTxs = useMemo((): SubaccountTx[] => {
    // Returning an empty array if no product is selected or form is empty
    if (!selectedProduct || formError || !validAmount) {
      return [];
    }

    const decimalAdjustedInputAmount = addDecimals(validAmount);
    return [
      {
        type: 'apply_delta',
        tx: {
          productId: selectedProduct.productId,
          amountDelta: decimalAdjustedInputAmount.negated(),
          vQuoteDelta: BigNumbers.ZERO,
        },
      },
    ];
  }, [formError, selectedProduct, validAmount]);

  // Form submit handler
  const onSubmitForm = useCallback(
    (values: WithdrawFormValues) => {
      if (selectedProduct == null) {
        console.warn('No selected product');
        return;
      }

      // No-op if there is no input, this prevents users from clicking on success button states
      if (!values.amount) {
        return;
      }

      const inputAmount = resolveAmountFractionSubmitValue(
        values,
        decimalAdjustedMaxWithdrawableWithFee,
      );
      // Amount submitted via form is inclusive of fee, but the amount in tx is exclusive
      const amountToWithdraw = inputAmount.minus(selectedProduct.fee.amount);
      if (amountToWithdraw.lte(0)) {
        console.warn('Invalid withdrawal amount', amountToWithdraw);
        return;
      }

      const decimalAdjustedAmountToWithdraw = addDecimals(
        amountToWithdraw,
        selectedProduct.tokenDecimals,
      );

      const serverExecutionResult = executeWithdrawCollateral.mutateAsync(
        {
          productId: selectedProduct.productId,
          amount: roundToString(decimalAdjustedAmountToWithdraw, 0),
          spotLeverage: enableBorrows ?? false,
        },
        {
          // Reset the form on success
          onSuccess: () => {
            // Calling setValue instead of resetField because we never registered amountFraction
            useWithdrawForm.setValue('amountFraction', 0);
            useWithdrawForm.resetField('amount');
            useWithdrawForm.resetField('amountSource');
          },
        },
      );

      dispatchNotification({
        type: 'action_error_handler',
        data: {
          errorNotificationTitle: 'Withdraw Failed',
          executionData: {
            serverExecutionResult,
          },
        },
      });
    },
    [
      decimalAdjustedMaxWithdrawableWithFee,
      dispatchNotification,
      enableBorrows,
      executeWithdrawCollateral,
      selectedProduct,
      useWithdrawForm,
    ],
  );

  return {
    form: useWithdrawForm,
    suggestBorrowing: !enableBorrows,
    formError,
    amountInputValueUsd:
      selectedProduct && validAmount
        ? toBigNumber(validAmount).multipliedBy(selectedProduct.oraclePrice)
        : undefined,
    withdrawMutation: executeWithdrawCollateral,
    showGasWarning: areWithdrawalsDelayed,
    showOneClickTradingPrompt,
    validAmountFraction,
    availableProducts,
    selectedProduct,
    selectedProductMaxWithdrawable: decimalAdjustedMaxWithdrawableWithFee,
    buttonState,
    estimateStateTxs,
    enableBorrows,
    validateAmount,
    onFractionSelected,
    onMaxAmountSelected: () => onFractionSelected(1),
    onEnableBorrowsChange,
    onSubmit: useWithdrawForm.handleSubmit(onSubmitForm),
  };
}
