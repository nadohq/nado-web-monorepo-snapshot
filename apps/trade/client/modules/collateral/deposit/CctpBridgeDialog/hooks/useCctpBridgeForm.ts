import { removeDecimals } from '@nadohq/client';
import {
  fractionValidator,
  InputValidatorFn,
  safeParseForData,
} from '@nadohq/web-common';
import { useDebounce } from 'ahooks';
import { BigNumber } from 'bignumber.js';
import { MIN_INITIAL_DEPOSIT_VALUE } from 'client/hooks/subaccount/useMinInitialDepositAmountByProductId';
import { useLinkedAmountFractionInputEffects } from 'client/hooks/ui/form/useLinkedAmountFractionInputEffects';
import {
  OnFractionSelectedHandler,
  useOnFractionSelectedHandler,
} from 'client/hooks/ui/form/useOnFractionSelectedHandler';
import {
  RUN_WITH_DELAY_DURATIONS,
  useRunWithDelayOnCondition,
} from 'client/hooks/util/useRunWithDelayOnCondition';
import {
  CctpChainConfig,
  CctpSourceChainId,
  getCctpChainConfig,
  USDC_TOKEN_INFO,
} from 'client/modules/collateral/deposit/CctpBridgeDialog/config';
import { useExecuteCctpBridge } from 'client/modules/collateral/deposit/CctpBridgeDialog/hooks/execute/useExecuteCctpBridge';
import { useQueryCctpEstimate } from 'client/modules/collateral/deposit/CctpBridgeDialog/hooks/query/useQueryCctpEstimate';
import { useCctpBridgeFormSubmitHandler } from 'client/modules/collateral/deposit/CctpBridgeDialog/hooks/useCctpBridgeFormSubmitHandler';
import {
  CctpBridgeButtonState,
  CctpBridgeErrorType,
  CctpBridgeFormValues,
} from 'client/modules/collateral/deposit/CctpBridgeDialog/types';
import { useQueryTokenBalance } from 'client/modules/collateral/deposit/hooks/query/useQueryTokenBalance';
import { watchFormError } from 'client/utils/form/watchFormError';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';
import { useCallback, useMemo } from 'react';
import { useForm, UseFormReturn, useWatch } from 'react-hook-form';
import { Address } from 'viem';

interface Params {
  /** Destination address on Ink chain. */
  destinationAddress: Address;
  initialProductId: number;
  selectedChainId: CctpSourceChainId;
}

/**
 * Return type for the CCTP bridge form hook.
 */
export interface UseCctpBridgeForm {
  /** React Hook Form instance. */
  form: UseFormReturn<CctpBridgeFormValues>;
  /** Current form error, if any. */
  formError: CctpBridgeErrorType | undefined;
  /** Chain config for the selected source chain. */
  sourceChainConfig: CctpChainConfig;
  /** USDC balance on selected source chain. */
  sourceBalance: BigNumber | undefined;
  /** Validated amount from form input. */
  validAmount: BigNumber | undefined;
  /** Current button state. */
  buttonState: CctpBridgeButtonState;
  /** Amount validator function. */
  validateAmount: InputValidatorFn<string, CctpBridgeErrorType>;
  /** Fraction button handler. */
  onFractionSelected: OnFractionSelectedHandler;
  /** Max button handler. */
  onMaxAmountSelected: () => void;
  /** Form submit handler. */
  onSubmit: () => void;
  /** Source chain ID. */
  sourceChainId: CctpSourceChainId;
  /** Summary metrics derived from estimate data. */
  summary: {
    /** Receive amount after bridge. */
    receiveAmount: BigNumber | undefined;
    /** Gas fees in native currency. */
    gasFees: BigNumber | undefined;
    /** Protocol fee in USDC. */
    protocolFee: BigNumber | undefined;
    /** Relay fee in USDC. */
    relayFee: BigNumber | undefined;
  };
  /** Minimum deposit amount. */
  minDepositAmount: BigNumber;
}

// USDC bridge slippage can be high - bump the actual min value by a bit so that the amount received
// is always > MIN_INITIAL_DEPOSIT_VALUE
const MIN_DEPOSIT_AMOUNT = MIN_INITIAL_DEPOSIT_VALUE.plus(2);

/**
 * Main orchestrator hook for the CCTP bridge form.
 * SDK handles approvals internally as part of the bridge operation.
 */
export function useCctpBridgeForm({
  destinationAddress,
  initialProductId,
  selectedChainId,
}: Params): UseCctpBridgeForm {
  // Form setup with linked fraction/amount pattern
  const form = useForm<CctpBridgeFormValues>({
    defaultValues: {
      sourceChainId: selectedChainId,
      productId: initialProductId,
      amount: '',
      amountFraction: 0,
      amountSource: 'absolute',
    },
    mode: 'onTouched',
  });

  const [sourceChainId, amountInput, amountFractionInput] = useWatch({
    control: form.control,
    name: ['sourceChainId', 'amount', 'amountFraction'],
  });
  const sourceChainConfig = getCctpChainConfig(sourceChainId);

  // Queries
  const { data: sourceBalanceData } = useQueryTokenBalance({
    chainId: sourceChainId,
    tokenAddress: sourceChainConfig.usdcAddress,
  });

  const sourceBalance = useMemo(
    () => removeDecimals(sourceBalanceData, USDC_TOKEN_INFO.decimals),
    [sourceBalanceData],
  );

  // Parsed values
  const validAmount = useMemo(() => {
    return safeParseForData(positiveBigNumberValidator, amountInput);
  }, [amountInput]);

  const validAmountFraction = useMemo(() => {
    return safeParseForData(fractionValidator, amountFractionInput);
  }, [amountFractionInput]);

  // Link fraction buttons to amount input
  useLinkedAmountFractionInputEffects({
    form,
    validAmount,
    validAmountFraction,
    maxAmount: sourceBalance,
  });

  const debouncedAmount = useDebounce(validAmount, { wait: 500 });

  const { data: estimateData } = useQueryCctpEstimate({
    sourceChainId,
    amount: debouncedAmount,
    destinationAddress,
  });

  // Bridge mutation - SDK handles approval internally
  const executeBridge = useExecuteCctpBridge();

  const isBridgeLoading = executeBridge.isPending;
  const isBridgeSuccess = executeBridge.isSuccess;

  // Reset mutation state when bridge completes
  useRunWithDelayOnCondition({
    condition: isBridgeSuccess,
    fn: () => {
      executeBridge.reset();
    },
    delay: RUN_WITH_DELAY_DURATIONS.LONG,
  });

  // Validators
  const validateAmount = useCallback<
    InputValidatorFn<string, CctpBridgeErrorType>
  >(
    (value) => {
      if (!value) return;

      const parsed = positiveBigNumberValidator.safeParse(value);
      if (!parsed.success) {
        return 'invalid_input';
      }

      if (parsed.data.lt(MIN_DEPOSIT_AMOUNT)) {
        return 'below_min';
      }

      if (sourceBalance && parsed.data.gt(sourceBalance)) {
        return 'max_exceeded';
      }
    },
    [sourceBalance],
  );

  const amountInputError: CctpBridgeErrorType | undefined = watchFormError(
    form,
    'amount',
  );

  const buttonState = useMemo((): CctpBridgeButtonState => {
    if (isBridgeLoading) return 'loading';
    if (isBridgeSuccess) return 'success';
    if (!amountInput || amountInputError) return 'disabled';

    return 'idle';
  }, [isBridgeLoading, isBridgeSuccess, amountInput, amountInputError]);

  // Fraction handlers
  const onFractionSelected = useOnFractionSelectedHandler({
    setValue: form.setValue,
  });

  // Form submit handler
  const onSubmitForm = useCctpBridgeFormSubmitHandler({
    form,
    destinationAddress,
    sourceBalance,
    mutateBridgeAsync: executeBridge.mutateAsync,
  });

  return {
    form,
    formError: amountInputError,
    sourceChainConfig,
    sourceBalance,
    validAmount,
    summary: {
      receiveAmount: estimateData?.receiveAmount,
      gasFees: estimateData?.gasFees,
      protocolFee: estimateData?.protocolFees,
      relayFee: estimateData?.forwarderFees,
    },
    sourceChainId,
    buttonState,
    validateAmount,
    onFractionSelected,
    onMaxAmountSelected: () => onFractionSelected(1),
    onSubmit: form.handleSubmit(onSubmitForm),
    minDepositAmount: MIN_DEPOSIT_AMOUNT,
  };
}
