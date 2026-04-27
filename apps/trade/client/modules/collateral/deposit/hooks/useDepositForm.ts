import {
  addDecimals,
  BigNumbers,
  QUOTE_PRODUCT_ID,
  SubaccountTx,
  toBigNumber,
} from '@nadohq/client';
import {
  fractionValidator,
  InputValidatorFn,
  safeParseForData,
} from '@nadohq/web-common';
import { MutationStatus } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useExecuteApproveAllowanceForProduct } from 'client/hooks/execute/useExecuteApproveAllowanceForProduct';
import { useExecuteDepositCollateral } from 'client/hooks/execute/useExecuteDepositCollateral';
import { useRequiresInitialDeposit } from 'client/hooks/subaccount/useRequiresInitialDeposit';
import {
  OnFractionSelectedHandler,
  useOnFractionSelectedHandler,
} from 'client/hooks/ui/form/useOnFractionSelectedHandler';
import { useOnChainMutationStatus } from 'client/hooks/util/useOnChainMutationStatus';
import {
  RUN_WITH_DELAY_DURATIONS,
  useRunWithDelayOnCondition,
} from 'client/hooks/util/useRunWithDelayOnCondition';
import { useDepositFormData } from 'client/modules/collateral/deposit/hooks/useDepositFormData';
import { useDepositFormDisplayedInfoCardType } from 'client/modules/collateral/deposit/hooks/useDepositFormDisplayedInfoCardType';
import { useDepositFormOnChangeSideEffects } from 'client/modules/collateral/deposit/hooks/useDepositFormOnChangeSideEffects';
import { useDepositFormSubmitHandler } from 'client/modules/collateral/deposit/hooks/useDepositFormSubmitHandler';
import {
  DepositActionButtonState,
  DepositErrorType,
  DepositFormValues,
  DepositInfoCardType,
  DepositProductSelectValue,
} from 'client/modules/collateral/deposit/types';
import { watchFormError } from 'client/utils/form/watchFormError';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';
import { useCallback, useMemo } from 'react';
import { useForm, UseFormReturn, useWatch } from 'react-hook-form';

export interface UseDepositForm {
  // Form errors indicate when to show an input error state
  form: UseFormReturn<DepositFormValues>;
  formError: DepositErrorType | undefined;
  depositCollateralMutationStatus: MutationStatus;
  // Form data
  selectedProduct: DepositProductSelectValue | undefined;
  availableProducts: DepositProductSelectValue[];
  minDepositAmount: BigNumber | undefined;
  // Parsed amounts
  validAmount: BigNumber | undefined;
  amountInputValueUsd: BigNumber | undefined;
  validAmountFraction: number | undefined;
  // Form state
  displayedInfoCardType: DepositInfoCardType | undefined;
  buttonState: DepositActionButtonState;
  estimateStateTxs: SubaccountTx[];
  isInitialDeposit: boolean;
  validateAmount: InputValidatorFn<string, DepositErrorType>;
  // Handlers
  onFractionSelected: OnFractionSelectedHandler;
  onMaxAmountSelected: () => void;
  onSubmit: () => void;
}

export function useDepositForm({
  initialProductId,
}: {
  initialProductId: number | undefined;
}): UseDepositForm {
  const isInitialDeposit = useRequiresInitialDeposit();

  const useDepositForm = useForm<DepositFormValues>({
    defaultValues: {
      productId: initialProductId ?? QUOTE_PRODUCT_ID,
      amount: '',
      amountSource: 'absolute',
    },
    mode: 'onTouched',
  });
  // Watched inputs
  const [amountFractionInput, depositAmount, productIdInput] = useWatch({
    control: useDepositForm.control,
    name: ['amountFraction', 'amount', 'productId'],
  });

  const depositAmountInput = depositAmount.trim();

  const amountInputError: DepositErrorType | undefined = watchFormError(
    useDepositForm,
    'amount',
  );

  // Data
  const {
    availableProducts,
    hasLoadedDepositableBalances,
    tokenAllowance,
    selectedProduct,
  } = useDepositFormData({ productIdInput });

  const minDepositAmount = isInitialDeposit
    ? selectedProduct?.decimalAdjustedMinimumInitialDepositAmount
    : BigNumbers.ZERO;

  // Validators
  const validateAmount = useCallback<
    InputValidatorFn<string, DepositErrorType>
  >(
    (depositAmount) => {
      if (!depositAmount) {
        return;
      }

      // Check valid input first
      const parsedAmount = positiveBigNumberValidator.safeParse(depositAmount);
      if (!parsedAmount.success) {
        return 'invalid_input';
      }

      // Check min deposit
      if (minDepositAmount && parsedAmount.data.lt(minDepositAmount)) {
        return 'below_min';
      }
    },
    [minDepositAmount],
  );

  // Parsed Amounts
  const validAmount = useMemo(() => {
    return safeParseForData(positiveBigNumberValidator, depositAmountInput);
  }, [depositAmountInput]);

  const validAmountFraction = useMemo(() => {
    return safeParseForData(fractionValidator, amountFractionInput);
  }, [amountFractionInput]);

  // Change effects
  useDepositFormOnChangeSideEffects({
    validAmount,
    validAmountFraction,
    selectedProduct,
    useDepositForm,
    productIdInput,
  });

  // Mutations
  const executeApproveAllowance = useExecuteApproveAllowanceForProduct();
  const executeDepositCollateral = useExecuteDepositCollateral();

  const { isLoading: isApprovalTxLoading, isSuccess: isApprovalTxSuccess } =
    useOnChainMutationStatus({
      mutationStatus: executeApproveAllowance.status,
      txHash: executeApproveAllowance.data,
    });

  useRunWithDelayOnCondition({
    condition: isApprovalTxSuccess,
    fn: executeApproveAllowance.reset,
    delay: RUN_WITH_DELAY_DURATIONS.LONG,
  });

  const { isLoading: isDepositTxLoading, isSuccess: isDepositTxSuccess } =
    useOnChainMutationStatus({
      mutationStatus: executeDepositCollateral.status,
      txHash: executeDepositCollateral.data,
    });

  useRunWithDelayOnCondition({
    condition: isDepositTxSuccess,
    fn: executeDepositCollateral.reset,
    delay: RUN_WITH_DELAY_DURATIONS.LONG,
  });

  // Deposit by default, approve if we don't have enough allowance
  const isApprove = useMemo(() => {
    if (!selectedProduct || !validAmount) {
      return false;
    }
    const decimalAdjustedAmount = addDecimals(
      validAmount,
      selectedProduct.tokenDecimals,
    );

    return tokenAllowance?.lt(decimalAdjustedAmount) ?? false;
  }, [selectedProduct, tokenAllowance, validAmount]);

  // Global form error state
  const formError: DepositErrorType | undefined = useMemo(() => {
    if (selectedProduct == null) {
      return;
    }
    return amountInputError;
  }, [selectedProduct, amountInputError]);

  // Action button state
  const buttonState = useMemo((): DepositActionButtonState => {
    if (isApprovalTxLoading) {
      return 'approve_loading';
    } else if (isDepositTxLoading) {
      return 'loading';
    } else if (isApprovalTxSuccess) {
      return 'approve_success';
    } else if (isDepositTxSuccess) {
      return 'success';
    } else if (!depositAmountInput || !selectedProduct || !!formError) {
      return 'disabled';
    } else if (isApprove) {
      return 'approve_idle';
    } else {
      return 'idle';
    }
  }, [
    isDepositTxLoading,
    isApprovalTxLoading,
    isApprovalTxSuccess,
    isDepositTxSuccess,
    depositAmountInput,
    selectedProduct,
    formError,
    isApprove,
  ]);

  // Formatted deltas for the selected product
  const estimateStateTxs = useMemo((): SubaccountTx[] => {
    // Returning an empty array if no product is selected or form is empty
    if (!selectedProduct || formError || !validAmount) {
      return [];
    }
    const productId = selectedProduct.productId;
    // This does not use token decimals because the query goes to the backend
    const decimalAdjustedAmount = addDecimals(toBigNumber(validAmount));

    return [
      {
        type: 'apply_delta',
        tx: {
          productId,
          amountDelta: decimalAdjustedAmount,
          vQuoteDelta: BigNumbers.ZERO,
        },
      },
    ];
  }, [selectedProduct, validAmount, formError]);

  const onFractionSelected = useOnFractionSelectedHandler({
    setValue: useDepositForm.setValue,
  });

  // Form submit handler
  const onSubmitForm = useDepositFormSubmitHandler({
    selectedProduct,
    isApprove,
    mutateDepositCollateralAsync: executeDepositCollateral.mutateAsync,
    mutateApproveAllowanceAsync: executeApproveAllowance.mutateAsync,
    useDepositForm,
  });

  const displayedInfoCardType = useDepositFormDisplayedInfoCardType({
    selectedProduct,
    hasLoadedDepositableBalances,
  });

  return {
    amountInputValueUsd: selectedProduct
      ? validAmount?.multipliedBy(selectedProduct.oraclePrice)
      : undefined,
    availableProducts,
    buttonState,
    depositCollateralMutationStatus: executeDepositCollateral.status,
    displayedInfoCardType,
    estimateStateTxs,
    form: useDepositForm,
    formError,
    isInitialDeposit,
    minDepositAmount,
    onFractionSelected,
    onMaxAmountSelected: () => onFractionSelected(1),
    onSubmit: useDepositForm.handleSubmit(onSubmitForm),
    selectedProduct,
    validAmount,
    validAmountFraction,
    validateAmount,
  };
}
