import { EngineWithdrawCollateralParams } from '@nadohq/client';
import { useMutation } from '@tanstack/react-query';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useCallback } from 'react';

/**
 * Execute hook for withdrawing collateral.
 *
 * Query refetches are handled by WS event listeners
 */
export function useExecuteWithdrawCollateral() {
  const mutationFn = useExecuteInValidContext(
    useCallback(
      async (
        params: Pick<
          EngineWithdrawCollateralParams,
          'productId' | 'amount' | 'spotLeverage'
        >,
        context: ValidExecuteContext,
      ) => {
        console.log('Withdrawing Collateral', params);
        const currentSubaccountName = context.subaccount.name;
        return context.nadoClient.spot.withdraw({
          subaccountName: currentSubaccountName,
          productId: params.productId,
          amount: params.amount,
          spotLeverage: params.spotLeverage,
        });
      },
      [],
    ),
  );

  const mutation = useMutation({
    mutationFn,
    onError(error, variables) {
      logExecuteError('WithdrawCollateral', error, variables);
    },
  });

  return mutation;
}
