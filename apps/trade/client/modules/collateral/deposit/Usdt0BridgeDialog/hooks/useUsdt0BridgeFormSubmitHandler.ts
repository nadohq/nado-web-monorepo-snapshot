import { addDecimals, toBigNumber } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { USDT0_DECIMALS } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/config';
import { useExecuteUsdt0Approval } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/hooks/execute/useExecuteUsdt0Approval';
import { useExecuteUsdt0Bridge } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/hooks/execute/useExecuteUsdt0Bridge';
import { Usdt0BridgeFormValues } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/types';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { resolveAmountFractionSubmitValue } from 'client/utils/form/resolveAmountFractionSubmitValue';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';

interface Params {
  /** Form instance. */
  form: UseFormReturn<Usdt0BridgeFormValues>;
  /** Destination address on Ink. */
  destinationAddress: Address;
  /** Whether approval is needed. */
  isApprovalNeeded: boolean;
  /** Source balance (decimal adjusted) used for exact max resolution. */
  sourceBalance: BigNumber | undefined;
  /** Approval mutation async function. */
  mutateApprovalAsync: ReturnType<
    typeof useExecuteUsdt0Approval
  >['mutateAsync'];
  /** Bridge mutation async function. */
  mutateBridgeAsync: ReturnType<typeof useExecuteUsdt0Bridge>['mutateAsync'];
}

/**
 * Creates the form submit handler for USDT0 bridge form.
 * Handles both approval and bridge execution flows.
 */
export function useUsdt0BridgeFormSubmitHandler({
  form,
  destinationAddress,
  isApprovalNeeded,
  sourceBalance,
  mutateApprovalAsync,
  mutateBridgeAsync,
}: Params) {
  const { t } = useTranslation();
  const { dispatchNotification } = useNotificationManagerContext();

  return (values: Usdt0BridgeFormValues) => {
    const amount = resolveAmountFractionSubmitValue(values, sourceBalance);

    if (amount.lte(0)) {
      console.warn(
        '[useUsdt0BridgeFormSubmitHandler] Invalid amount',
        amount.toString(),
      );
      return;
    }

    const decimalAdjustedAmount = addDecimals(
      toBigNumber(amount),
      USDT0_DECIMALS,
    );

    if (isApprovalNeeded) {
      // Execute approval for exact deposit amount
      const txHashPromise = mutateApprovalAsync({
        amount: decimalAdjustedAmount,
      });

      dispatchNotification({
        type: 'action_error_handler',
        data: {
          errorNotificationTitle: t(($) => $.errors.approvalFailed),
          executionData: {
            txHashPromise,
          },
        },
      });
    } else {
      // Execute bridge (refetches quote at execution time)
      const txHashPromise = mutateBridgeAsync(
        {
          amount: decimalAdjustedAmount,
          destinationAddress,
        },
        {
          onSuccess: () => {
            form.setValue('amountFraction', 0);
            form.resetField('amount');
            form.resetField('amountSource');
          },
        },
      );

      dispatchNotification({
        type: 'usdt0_bridge',
        data: {
          txHashPromise,
        },
      });
    }
  };
}
