import { addDecimals, removeDecimals } from '@nadohq/client';
import {
  fractionValidator,
  InputValidatorFn,
  safeParseForData,
} from '@nadohq/web-common';
import { useDebounce } from 'ahooks';
import { useLinkedAmountFractionInputEffects } from 'client/hooks/ui/form/useLinkedAmountFractionInputEffects';
import {
  OnFractionSelectedHandler,
  useOnFractionSelectedHandler,
} from 'client/hooks/ui/form/useOnFractionSelectedHandler';
import { useSanitizedNumericOnChange } from 'client/hooks/ui/form/useSanitizedNumericOnChange';
import { ChangeEventHandler, useCallback, useMemo } from 'react';
import { useForm, UseFormRegisterReturn, useWatch } from 'react-hook-form';
import { Address } from 'viem';

import { BigNumber } from 'bignumber.js';
import { MIN_INITIAL_DEPOSIT_VALUE } from 'client/hooks/subaccount/useMinInitialDepositAmountByProductId';
import { useOnChainMutationStatus } from 'client/hooks/util/useOnChainMutationStatus';
import {
  RUN_WITH_DELAY_DURATIONS,
  useRunWithDelayOnCondition,
} from 'client/hooks/util/useRunWithDelayOnCondition';
import { useQueryTokenBalance } from 'client/modules/collateral/deposit/hooks/query/useQueryTokenBalance';
import {
  getUsdt0SourceChainConfig,
  USDT0_DECIMALS,
  Usdt0SourceChainConfig,
  Usdt0SourceChainId,
} from 'client/modules/collateral/deposit/Usdt0BridgeDialog/config';
import { useExecuteUsdt0Approval } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/hooks/execute/useExecuteUsdt0Approval';
import { useExecuteUsdt0Bridge } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/hooks/execute/useExecuteUsdt0Bridge';
import { useQueryUsdt0Allowance } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/hooks/query/useQueryUsdt0Allowance';
import { useQueryUsdt0BridgeQuote } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/hooks/query/useQueryUsdt0BridgeQuote';
import { useUsdt0BridgeFormSubmitHandler } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/hooks/useUsdt0BridgeFormSubmitHandler';
import {
  Usdt0BridgeButtonState,
  Usdt0BridgeErrorType,
  Usdt0BridgeFormValues,
} from 'client/modules/collateral/deposit/Usdt0BridgeDialog/types';
import { watchFormError } from 'client/utils/form/watchFormError';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';

interface Params {
  /** Destination address on Ink chain (DDA). */
  destinationAddress: Address;
  initialProductId: number;
  selectedChainId: Usdt0SourceChainId;
}

/**
 * Return type for the USDT0 bridge form hook.
 */
export interface UseUsdt0BridgeForm {
  /** Current form error, if any. */
  formError: Usdt0BridgeErrorType | undefined;
  /** Selected source chain ID. */
  sourceChainId: Usdt0SourceChainId;
  /** Configuration for the selected source chain. */
  sourceChainConfig: Usdt0SourceChainConfig;
  /** USDT/USDT0 balance on selected source chain (decimal adjusted). */
  sourceBalance: BigNumber | undefined;
  /** Current button state. */
  buttonState: Usdt0BridgeButtonState;
  /** Amount register from react-hook-form. */
  amountRegister: UseFormRegisterReturn<'amount'>;
  /** Minimum deposit amount (decimal adjusted), accounting for OFT limits and initial deposit. */
  minDepositAmount: BigNumber | undefined;
  /** Summary metrics derived from quote data (decimal adjusted). */
  summary: {
    /** Receive amount after bridge. */
    receiveAmount: BigNumber | undefined;
    /** LayerZero messaging fee in native currency. */
    layerZeroFee: BigNumber | undefined;
    /** Protocol fee in USDT. */
    protocolFee: BigNumber | undefined;
  };
  /** Handler for amount input change with sanitization. */
  onAmountChange: ChangeEventHandler<HTMLInputElement>;
  /** Callback when fraction button is clicked. */
  onFractionSelected: OnFractionSelectedHandler;
  /** Callback to set max amount. */
  onMaxAmountSelected: () => void;
  /** Form submit handler. */
  onSubmit: () => void;
}

/**
 * Main orchestrator hook for the USDT0 bridge form.
 * Combines form state, queries, and mutations following codebase patterns.
 */
export function useUsdt0BridgeForm({
  destinationAddress,
  initialProductId,
  selectedChainId,
}: Params): UseUsdt0BridgeForm {
  // Form setup
  const form = useForm<Usdt0BridgeFormValues>({
    defaultValues: {
      sourceChainId: selectedChainId,
      productId: initialProductId,
      amount: '',
      amountFraction: 0,
      amountSource: 'absolute',
    },
    mode: 'onTouched',
  });

  const [sourceChainId, amountInput, amountFraction] = useWatch({
    control: form.control,
    name: ['sourceChainId', 'amount', 'amountFraction'],
  });

  const sourceChainConfig = getUsdt0SourceChainConfig(sourceChainId);

  // Queries
  const { data: sourceBalanceData } = useQueryTokenBalance({
    chainId: sourceChainConfig.viemChain.id,
    tokenAddress: sourceChainConfig.tokenAddress,
  });

  const sourceBalance = useMemo(() => {
    return removeDecimals(sourceBalanceData, USDT0_DECIMALS);
  }, [sourceBalanceData]);

  const { data: allowance } = useQueryUsdt0Allowance({
    sourceChainId,
  });

  // Parsed values
  const validAmount = useMemo(() => {
    return safeParseForData(positiveBigNumberValidator, amountInput);
  }, [amountInput]);

  const debouncedAmount = useDebounce(validAmount, { wait: 500 });

  const { data: quoteData } = useQueryUsdt0BridgeQuote({
    sourceChainId,
    amount: debouncedAmount,
    recipientAddress: destinationAddress,
  });

  const validAmountFraction = useMemo(() => {
    return safeParseForData(fractionValidator, amountFraction);
  }, [amountFraction]);

  // Linked amount/fraction effects
  useLinkedAmountFractionInputEffects({
    validAmount,
    validAmountFraction,
    maxAmount: sourceBalance,
    form,
  });

  // Check if approval is needed
  const isApprovalNeeded = useMemo(() => {
    if (!allowance || !validAmount) return false;
    const requiredAllowance = addDecimals(validAmount, USDT0_DECIMALS);
    return allowance.lt(requiredAllowance);
  }, [allowance, validAmount]);

  // Mutations
  const executeApproval = useExecuteUsdt0Approval({ sourceChainId });
  const executeBridge = useExecuteUsdt0Bridge({ sourceChainId });

  const { isLoading: isApprovalTxLoading, isSuccess: isApprovalTxSuccess } =
    useOnChainMutationStatus({
      mutationStatus: executeApproval.status,
      txHash: executeApproval.data,
    });

  useRunWithDelayOnCondition({
    condition: isApprovalTxSuccess,
    fn: executeApproval.reset,
    delay: RUN_WITH_DELAY_DURATIONS.LONG,
  });

  const { isLoading: isBridgeTxLoading, isSuccess: isBridgeTxSuccess } =
    useOnChainMutationStatus({
      mutationStatus: executeBridge.status,
      txHash: executeBridge.data,
    });

  useRunWithDelayOnCondition({
    condition: isBridgeTxSuccess,
    fn: executeBridge.reset,
    delay: RUN_WITH_DELAY_DURATIONS.LONG,
  });

  // Effective minimum deposit amount: the larger of the OFT contract minimum
  // and the platform minimum for DDA deposits.
  const minDepositAmount = useMemo(() => {
    if (!quoteData) {
      return MIN_INITIAL_DEPOSIT_VALUE;
    }

    const oftMin = removeDecimals(quoteData.minAmount, USDT0_DECIMALS);

    return BigNumber.max(oftMin, MIN_INITIAL_DEPOSIT_VALUE);
  }, [quoteData]);

  // Validators
  const validateAmount = useCallback<
    InputValidatorFn<string, Usdt0BridgeErrorType>
  >(
    (value) => {
      if (!value) return;

      const parsed = positiveBigNumberValidator.safeParse(value);
      if (!parsed.success) {
        return 'invalid_input';
      }

      const parsedAmount = parsed.data;

      // Check minimum deposit amount
      if (minDepositAmount && parsedAmount.lt(minDepositAmount)) {
        return 'below_min';
      }

      // Check balance and OFT max limit
      const maxAmount = removeDecimals(quoteData?.maxAmount, USDT0_DECIMALS);

      if (
        (sourceBalance && parsedAmount.gt(sourceBalance)) ||
        (maxAmount && parsedAmount.gt(maxAmount))
      ) {
        return 'max_exceeded';
      }
    },
    [minDepositAmount, sourceBalance, quoteData],
  );

  /** Watch form error for amount input. */
  const formError: Usdt0BridgeErrorType | undefined = watchFormError(
    form,
    'amount',
  );

  // Button state
  const buttonState = useMemo((): Usdt0BridgeButtonState => {
    if (isApprovalTxLoading) return 'approve_loading';
    if (isBridgeTxLoading) return 'loading';
    if (isApprovalTxSuccess) return 'approve_success';
    if (isBridgeTxSuccess) return 'success';
    if (!amountInput || formError) return 'disabled';
    if (isApprovalNeeded) return 'approve_idle';
    return 'idle';
  }, [
    isApprovalTxLoading,
    isBridgeTxLoading,
    isApprovalTxSuccess,
    isBridgeTxSuccess,
    amountInput,
    formError,
    isApprovalNeeded,
  ]);

  // Submit handler
  const onSubmitForm = useUsdt0BridgeFormSubmitHandler({
    form,
    destinationAddress,
    isApprovalNeeded,
    sourceBalance,
    mutateApprovalAsync: executeApproval.mutateAsync,
    mutateBridgeAsync: executeBridge.mutateAsync,
  });

  // Fraction selection handlers
  const onFractionSelected = useOnFractionSelectedHandler({
    setValue: form.setValue,
  });

  const onMaxAmountSelected = useCallback(() => {
    onFractionSelected(1);
  }, [onFractionSelected]);

  // Amount input handling
  const amountRegister = form.register('amount', { validate: validateAmount });
  const onAmountChange = useSanitizedNumericOnChange(amountRegister.onChange);

  // Computed quote values
  const summary = useMemo(() => {
    const receiveAmount = removeDecimals(
      quoteData?.receiveAmount,
      USDT0_DECIMALS,
    );
    const layerZeroFee = removeDecimals(quoteData?.messagingFee?.nativeFee);

    const protocolFee = removeDecimals(
      quoteData?.sendAmount.minus(quoteData?.receiveAmount),
      USDT0_DECIMALS,
    );

    return { receiveAmount, layerZeroFee, protocolFee };
  }, [quoteData]);

  return {
    formError,
    sourceChainId,
    sourceChainConfig,
    sourceBalance,
    buttonState,
    amountRegister,
    minDepositAmount,
    summary,
    onAmountChange,
    onFractionSelected,
    onMaxAmountSelected,
    onSubmit: form.handleSubmit(onSubmitForm),
  };
}
