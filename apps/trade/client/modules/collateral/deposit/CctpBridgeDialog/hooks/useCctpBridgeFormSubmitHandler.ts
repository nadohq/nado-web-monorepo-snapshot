import { useEVMContext } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useExecuteCctpBridge } from 'client/modules/collateral/deposit/CctpBridgeDialog/hooks/execute/useExecuteCctpBridge';
import { CctpBridgeFormValues } from 'client/modules/collateral/deposit/CctpBridgeDialog/types';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { resolveAmountFractionSubmitValue } from 'client/utils/form/resolveAmountFractionSubmitValue';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';

interface Params {
  /** Form instance. */
  form: UseFormReturn<CctpBridgeFormValues>;
  /** Destination address on Ink. */
  destinationAddress: Address;
  /** Source balance for resolving 100% fraction amounts. */
  sourceBalance: BigNumber | undefined;
  /** Bridge mutation async function. */
  mutateBridgeAsync: ReturnType<typeof useExecuteCctpBridge>['mutateAsync'];
}

/**
 * Creates the form submit handler for CCTP bridge form.
 * The SDK handles approval internally as part of the bridge operation.
 *
 * @param params - Hook parameters including form instance and mutation functions.
 * @returns Form submit handler function.
 */
export function useCctpBridgeFormSubmitHandler({
  form,
  destinationAddress,
  sourceBalance,
  mutateBridgeAsync,
}: Params) {
  const { t } = useTranslation();
  const { dispatchNotification } = useNotificationManagerContext();
  const {
    connectionStatus: { address },
  } = useEVMContext();

  return (values: CctpBridgeFormValues) => {
    const amount = resolveAmountFractionSubmitValue(values, sourceBalance);

    if (amount.lte(0)) {
      console.warn(
        '[useCctpBridgeFormSubmitHandler] Invalid amount',
        amount.toString(),
      );
      return;
    }

    const resultPromise = mutateBridgeAsync(
      {
        sourceChainId: values.sourceChainId,
        amount: amount.toString(),
        destinationAddress,
      },
      {
        onSuccess: () => {
          form.setValue('amountFraction', 0);
          form.resetField('amount');
          form.resetField('amountSource');

          if (address) {
            dispatchNotification({
              type: 'cctp_bridge',
              data: { address },
            });
          }
        },
      },
    );

    dispatchNotification({
      type: 'action_error_handler',
      data: {
        errorNotificationTitle: t(($) => $.errors.depositFailed),
        executionData: {
          serverExecutionResult: resultPromise,
        },
      },
    });
  };
}
