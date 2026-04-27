import { addDecimals } from '@nadohq/client';
import {
  SEQUENCER_FEE_AMOUNT_USDT,
  SubaccountSigningPreference,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useExecuteSubaccountQuoteTransfer } from 'client/hooks/execute/useExecuteSubaccountQuoteTransfer';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { SubaccountQuoteTransferFormValues } from 'client/modules/subaccounts/hooks/useSubaccountQuoteTransferForm/types';
import { resolveAmountFractionSubmitValue } from 'client/utils/form/resolveAmountFractionSubmitValue';
import { roundToString } from 'client/utils/rounding';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Params {
  useSubaccountQuoteTransferForm: UseFormReturn<SubaccountQuoteTransferFormValues>;
  mutateQuoteTransferAsync: ReturnType<
    typeof useExecuteSubaccountQuoteTransfer
  >['mutateAsync'];
  decimalAdjustedMaxWithdrawableWithFee: BigNumber | undefined;
  senderSigningPreference: SubaccountSigningPreference | undefined;
}

export function useSubaccountQuoteTransferFormSubmitHandler({
  useSubaccountQuoteTransferForm,
  mutateQuoteTransferAsync,
  decimalAdjustedMaxWithdrawableWithFee,
  senderSigningPreference,
}: Params) {
  const { t } = useTranslation();
  const { dispatchNotification } = useNotificationManagerContext();

  return (values: SubaccountQuoteTransferFormValues) => {
    if (!values.amount) {
      return;
    }

    const inputAmount = resolveAmountFractionSubmitValue(
      values,
      decimalAdjustedMaxWithdrawableWithFee,
    );

    // Amount submitted via form is inclusive of fee, but the amount in tx is exclusive.
    const amountToTransfer = inputAmount.minus(SEQUENCER_FEE_AMOUNT_USDT);

    if (amountToTransfer.lte(0)) {
      console.warn('Invalid transfer amount', amountToTransfer);
      return;
    }

    const amountToTransferWithDecimals = addDecimals(amountToTransfer);

    const { senderSubaccountName, recipientSubaccountName } = values;

    const serverExecutionResult = mutateQuoteTransferAsync(
      {
        subaccountName: senderSubaccountName,
        recipientSubaccountName,
        amount: roundToString(amountToTransferWithDecimals, 0),
        senderSigningPreference,
      },
      {
        onSuccess: () => {
          useSubaccountQuoteTransferForm.setValue('amountFraction', 0);
          useSubaccountQuoteTransferForm.resetField('amount');
          useSubaccountQuoteTransferForm.resetField('amountSource');
        },
      },
    );

    dispatchNotification({
      type: 'action_error_handler',
      data: {
        errorNotificationTitle: t(($) => $.errors.transferFailed),
        executionData: { serverExecutionResult },
      },
    });
  };
}
