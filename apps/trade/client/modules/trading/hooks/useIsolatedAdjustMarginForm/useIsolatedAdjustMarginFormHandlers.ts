import { addDecimals, toBigNumber } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { ISO_MARGIN_TRANSFER_FEE_AMOUNT_USDT } from 'client/consts/isoMarginTransferFee';
import { useExecuteSubaccountQuoteTransfer } from 'client/hooks/execute/useExecuteSubaccountQuoteTransfer';
import { useOnFractionSelectedHandler } from 'client/hooks/ui/form/useOnFractionSelectedHandler';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { useSubaccountSigningPreferenceForSubaccount } from 'client/modules/singleSignatureSessions/hooks/useSubaccountSigningPreferenceForSubaccount';
import {
  IsolatedAdjustMarginFormValues,
  IsolatedAdjustMarginMode,
} from 'client/modules/trading/hooks/useIsolatedAdjustMarginForm/types';
import { roundToString } from 'client/utils/rounding';
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Params {
  form: UseFormReturn<IsolatedAdjustMarginFormValues>;
  executeFn: ReturnType<typeof useExecuteSubaccountQuoteTransfer>;
  validAmount: BigNumber | undefined;
  subaccounts: Record<'sender' | 'recipient', string>;
}

export function useIsolatedAdjustMarginFormHandlers({
  executeFn,
  form,
  subaccounts: { sender, recipient },
}: Params) {
  const { t } = useTranslation();

  const { dispatchNotification } = useNotificationManagerContext();
  const signingPreference = useSubaccountSigningPreferenceForSubaccount();
  const mutateQuoteTransferAsync = executeFn.mutateAsync;

  const onSubmitForm = useCallback(
    (values: IsolatedAdjustMarginFormValues) => {
      if (!values.amount) {
        return;
      }

      const inputAmount = toBigNumber(values.amount);

      // Amount submitted via form is inclusive of fee, but the amount in tx is exclusive.
      const amountToTransfer = addDecimals(
        inputAmount.minus(ISO_MARGIN_TRANSFER_FEE_AMOUNT_USDT),
      );

      const serverExecutionResult = mutateQuoteTransferAsync(
        {
          amount: roundToString(amountToTransfer, 0),
          recipientSubaccountName: recipient,
          subaccountName: sender,
          senderSigningPreference: signingPreference,
        },
        {
          onSuccess: () => {
            form.resetField('amount');
          },
        },
      );

      dispatchNotification({
        type: 'action_error_handler',
        data: {
          errorNotificationTitle: t(($) => $.errors.adjustMarginFailed),
          executionData: {
            serverExecutionResult,
          },
        },
      });
    },
    [
      dispatchNotification,
      form,
      mutateQuoteTransferAsync,
      recipient,
      signingPreference,
      sender,
      t,
    ],
  );

  const onFractionSelected = useOnFractionSelectedHandler({
    setValue: form.setValue,
  });

  const onEnableBorrowsChange = useCallback(
    (enabled: boolean) => {
      form.setValue('enableBorrows', enabled);
    },
    [form],
  );

  const onAdjustmentModeChange = useCallback(
    (adjustmentMode: IsolatedAdjustMarginMode) => {
      form.setValue('adjustmentMode', adjustmentMode);
    },
    [form],
  );

  const onMaxAmountClicked = useCallback(() => {
    onFractionSelected(1);
  }, [onFractionSelected]);

  return {
    onSubmitForm,
    onFractionSelected,
    onEnableBorrowsChange,
    onAdjustmentModeChange,
    onMaxAmountClicked,
  };
}
