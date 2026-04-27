import {
  addDecimals,
  BigNumbers,
  QUOTE_PRODUCT_ID,
  SubaccountTx,
  toBigNumber,
} from '@nadohq/client';
import {
  AppSubaccount,
  PRIMARY_SUBACCOUNT_NAME,
  SEQUENCER_FEE_AMOUNT_USDT,
  Token,
  useSubaccountContext,
  useSubaccountNames,
} from '@nadohq/react-client';
import {
  fractionValidator,
  InputValidatorFn,
  safeParseForData,
} from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { useExecuteSubaccountQuoteTransfer } from 'client/hooks/execute/useExecuteSubaccountQuoteTransfer';
import { useLinkedAmountFractionInputEffects } from 'client/hooks/ui/form/useLinkedAmountFractionInputEffects';
import {
  OnFractionSelectedHandler,
  useOnFractionSelectedHandler,
} from 'client/hooks/ui/form/useOnFractionSelectedHandler';
import {
  RUN_WITH_DELAY_DURATIONS,
  useRunWithDelayOnCondition,
} from 'client/hooks/util/useRunWithDelayOnCondition';
import { DepositErrorType } from 'client/modules/collateral/deposit/types';
import {
  SubaccountQuoteTransferErrorType,
  SubaccountQuoteTransferFormValues,
} from 'client/modules/subaccounts/hooks/useSubaccountQuoteTransferForm/types';
import { useSubaccountQuoteTransferAmountValidator } from 'client/modules/subaccounts/hooks/useSubaccountQuoteTransferForm/useSubaccountQuoteTransferAmountValidator';
import {
  QuoteTransferSubaccount,
  useSubaccountQuoteTransferFormData,
} from 'client/modules/subaccounts/hooks/useSubaccountQuoteTransferForm/useSubaccountQuoteTransferFormData';
import { useSubaccountQuoteTransferFormSubmitHandler } from 'client/modules/subaccounts/hooks/useSubaccountQuoteTransferForm/useSubaccountQuoteTransferFormSubmitHandler';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { watchFormError } from 'client/utils/form/watchFormError';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm, UseFormReturn, useWatch } from 'react-hook-form';

export interface UseSubaccountQuoteTransferForm {
  form: UseFormReturn<SubaccountQuoteTransferFormValues>;
  formError: SubaccountQuoteTransferErrorType | undefined;
  hasSameSubaccountError: boolean;
  amountInputValueUsd: BigNumber | undefined;
  validateAmount: InputValidatorFn<string, SubaccountQuoteTransferErrorType>;
  validAmountFraction?: number;
  onFractionSelected: OnFractionSelectedHandler;
  onEnableBorrowsChange: (enabled: boolean) => void;
  onSwapAccounts: () => void;
  enableBorrows: boolean;
  decimalAdjustedMaxWithdrawableWithFee: BigNumber | undefined;
  subaccounts: QuoteTransferSubaccount[];
  senderSubaccount: QuoteTransferSubaccount;
  recipientSubaccount: QuoteTransferSubaccount;
  currentSubaccount: AppSubaccount;
  primaryQuoteToken: Token;
  senderEstimateStateTxs: SubaccountTx[];
  recipientEstimateStateTxs: SubaccountTx[];
  senderQuoteBalanceDelta: BigNumber | undefined;
  recipientQuoteBalanceDelta: BigNumber | undefined;
  buttonState: BaseActionButtonState;
  onSubmit: () => void;
}

interface UseSubaccountQuoteTransferDialogParams {
  recipientSubaccountName?: string;
}

export function useSubaccountQuoteTransferForm({
  recipientSubaccountName: recipientSubaccountNameOverride,
}: UseSubaccountQuoteTransferDialogParams): UseSubaccountQuoteTransferForm {
  const { currentSubaccount } = useSubaccountContext();
  const { all: fetchedSubaccountNames } = useSubaccountNames();

  // Default sender is always primary subaccount.
  // Default recipient is current subaccount, unless current is primary,
  // in which case we pick the first non-primary subaccount if any.
  const defaultRecipientSubaccountName = useMemo(() => {
    if (currentSubaccount.name === PRIMARY_SUBACCOUNT_NAME) {
      return (
        fetchedSubaccountNames.find(
          (name) => name !== PRIMARY_SUBACCOUNT_NAME,
        ) ?? PRIMARY_SUBACCOUNT_NAME
      );
    }
    return currentSubaccount.name;
  }, [fetchedSubaccountNames, currentSubaccount.name]);

  const useSubaccountQuoteTransferForm =
    useForm<SubaccountQuoteTransferFormValues>({
      defaultValues: {
        senderSubaccountName: PRIMARY_SUBACCOUNT_NAME,
        recipientSubaccountName:
          recipientSubaccountNameOverride ?? defaultRecipientSubaccountName,
        enableBorrows: false,
        amount: '',
        amountSource: 'absolute',
        amountFraction: 0,
      },
      mode: 'onTouched',
    });

  const [
    senderSubaccountName,
    recipientSubaccountName,
    enableBorrows,
    transferAmount,
    amountFractionInput,
  ] = useWatch({
    control: useSubaccountQuoteTransferForm.control,
    name: [
      'senderSubaccountName',
      'recipientSubaccountName',
      'enableBorrows',
      'amount',
      'amountFraction',
    ],
  });

  const transferAmountInput = transferAmount.trim();

  const amountInputError: DepositErrorType | undefined = watchFormError(
    useSubaccountQuoteTransferForm,
    'amount',
  );

  const hasSameSubaccountError =
    recipientSubaccountName === senderSubaccountName;

  const {
    subaccounts,
    primaryQuoteToken,
    decimalAdjustedMaxWithdrawableWithFee,
    senderSigningPreference,
    senderSubaccount,
    recipientSubaccount,
  } = useSubaccountQuoteTransferFormData({
    senderSubaccountName,
    recipientSubaccountName,
    enableBorrows,
  });

  const { mutateAsync, isPending, isSuccess, reset } =
    useExecuteSubaccountQuoteTransfer();

  const validateAmount = useSubaccountQuoteTransferAmountValidator({
    maxAmount: decimalAdjustedMaxWithdrawableWithFee,
  });

  const validAmount = useMemo(() => {
    return safeParseForData(positiveBigNumberValidator, transferAmountInput);
  }, [transferAmountInput]);

  const amountInputValueUsd = validAmount
    ? toBigNumber(validAmount)
    : undefined;

  const validAmountFraction = useMemo(() => {
    return safeParseForData(fractionValidator, amountFractionInput);
  }, [amountFractionInput]);

  useLinkedAmountFractionInputEffects({
    validAmount,
    validAmountFraction,
    maxAmount: decimalAdjustedMaxWithdrawableWithFee,
    form: useSubaccountQuoteTransferForm,
  });

  useRunWithDelayOnCondition({
    condition: isSuccess,
    fn: reset,
    delay: RUN_WITH_DELAY_DURATIONS.LONG,
  });

  // Reset amount related inputs when `enableBorrows` changes.
  useEffect(() => {
    useSubaccountQuoteTransferForm.resetField('amount');
    useSubaccountQuoteTransferForm.setValue('amountFraction', 0);
  }, [enableBorrows, useSubaccountQuoteTransferForm]);

  const {
    senderEstimateStateTxs,
    recipientEstimateStateTxs,
    senderQuoteBalanceDelta,
    recipientQuoteBalanceDelta,
  } = useMemo((): {
    senderEstimateStateTxs: SubaccountTx[];
    recipientEstimateStateTxs: SubaccountTx[];
    senderQuoteBalanceDelta: BigNumber | undefined;
    recipientQuoteBalanceDelta: BigNumber | undefined;
  } => {
    if (!validAmount) {
      return {
        senderEstimateStateTxs: [],
        recipientEstimateStateTxs: [],
        senderQuoteBalanceDelta: undefined,
        recipientQuoteBalanceDelta: undefined,
      };
    }

    const senderQuoteBalanceDelta = toBigNumber(validAmount).negated();
    const recipientQuoteBalanceDelta = toBigNumber(validAmount).minus(
      SEQUENCER_FEE_AMOUNT_USDT,
    );

    const getEstimateStateTx = (amountDelta: BigNumber): SubaccountTx => ({
      type: 'apply_delta',
      tx: {
        productId: QUOTE_PRODUCT_ID,
        vQuoteDelta: BigNumbers.ZERO,
        // This does not use token decimals because the query goes to the backend.
        amountDelta: addDecimals(amountDelta),
      },
    });

    return {
      senderEstimateStateTxs: [getEstimateStateTx(senderQuoteBalanceDelta)],
      recipientEstimateStateTxs: [
        getEstimateStateTx(recipientQuoteBalanceDelta),
      ],
      senderQuoteBalanceDelta,
      recipientQuoteBalanceDelta,
    };
  }, [validAmount]);

  const buttonState = useMemo((): BaseActionButtonState => {
    if (isPending) {
      return 'loading';
    } else if (isSuccess) {
      return 'success';
    } else if (
      !transferAmountInput ||
      !!amountInputError ||
      hasSameSubaccountError
    ) {
      return 'disabled';
    } else {
      return 'idle';
    }
  }, [
    isPending,
    isSuccess,
    transferAmountInput,
    amountInputError,
    hasSameSubaccountError,
  ]);

  const onFractionSelected = useOnFractionSelectedHandler({
    setValue: useSubaccountQuoteTransferForm.setValue,
  });

  const onEnableBorrowsChange = useCallback(
    (enabled: boolean) => {
      useSubaccountQuoteTransferForm.setValue('enableBorrows', enabled);
    },
    [useSubaccountQuoteTransferForm],
  );

  const onSwapAccounts = useCallback(() => {
    useSubaccountQuoteTransferForm.setValue(
      'senderSubaccountName',
      recipientSubaccountName,
    );
    useSubaccountQuoteTransferForm.setValue(
      'recipientSubaccountName',
      senderSubaccountName,
    );
  }, [
    useSubaccountQuoteTransferForm,
    senderSubaccountName,
    recipientSubaccountName,
  ]);

  const onSubmitForm = useSubaccountQuoteTransferFormSubmitHandler({
    mutateQuoteTransferAsync: mutateAsync,
    senderSigningPreference,
    useSubaccountQuoteTransferForm,
    decimalAdjustedMaxWithdrawableWithFee,
  });

  return {
    form: useSubaccountQuoteTransferForm,
    formError: amountInputError,
    hasSameSubaccountError,
    amountInputValueUsd,
    validateAmount,
    validAmountFraction,
    onFractionSelected,
    enableBorrows,
    decimalAdjustedMaxWithdrawableWithFee,
    subaccounts,
    senderSubaccount,
    recipientSubaccount,
    currentSubaccount,
    primaryQuoteToken,
    senderEstimateStateTxs,
    recipientEstimateStateTxs,
    senderQuoteBalanceDelta,
    recipientQuoteBalanceDelta,
    buttonState,
    onEnableBorrowsChange,
    onSwapAccounts,
    onSubmit: useSubaccountQuoteTransferForm.handleSubmit(onSubmitForm),
  };
}
