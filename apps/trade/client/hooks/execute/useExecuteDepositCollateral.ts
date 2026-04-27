import { DepositCollateralParams } from '@nadohq/client';
import { useMutation } from '@tanstack/react-query';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useCallback } from 'react';

/**
 * Execute hook for depositing collateral.
 *
 * Query refetches are handled by WS event listeners
 */
export function useExecuteDepositCollateral() {
  const mutationFn = useExecuteInValidContext(
    useCallback(
      async (
        params: Pick<
          DepositCollateralParams,
          'productId' | 'amount' | 'referralCode'
        >,
        context: ValidExecuteContext,
      ) => {
        console.log('Depositing Collateral', params);

        const currentSubaccountName = context.subaccount.name;

        return context.nadoClient.spot.deposit({
          subaccountName: currentSubaccountName,
          productId: params.productId,
          amount: params.amount,
          referralCode: params.referralCode,
        });
      },
      [],
    ),
  );

  const mutation = useMutation({
    mutationFn,
    onError(error, variables) {
      logExecuteError('DepositCollateral', error, variables);
    },
  });

  return mutation;
}
