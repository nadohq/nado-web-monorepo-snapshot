import { EngineWithdrawCollateralV2Params } from '@nadohq/client';
import { useMutation } from '@tanstack/react-query';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useCallback } from 'react';
import { zeroAddress } from 'viem';

interface ExecuteWithdrawCollateralParams extends Pick<
  EngineWithdrawCollateralV2Params,
  'productId' | 'amount' | 'spotLeverage'
> {
  sendTo?: EngineWithdrawCollateralV2Params['sendTo'];
}

/**
 * Execute hook for withdrawing collateral.
 *
 * Query refetches are handled by WS event listeners
 */
export function useExecuteWithdrawCollateral() {
  const mutationFn = useExecuteInValidContext(
    useCallback(
      async (
        params: ExecuteWithdrawCollateralParams,
        context: ValidExecuteContext,
      ) => {
        console.log('Withdrawing Collateral', params);
        const currentSubaccountName = context.subaccount.name;
        return context.nadoClient.spot.withdrawV2({
          subaccountName: currentSubaccountName,
          productId: params.productId,
          amount: params.amount,
          spotLeverage: params.spotLeverage,
          // Zero address sends funds to the subaccount owner.
          sendTo: params.sendTo ?? zeroAddress,
          // Reserved uint128 for forward-compatible withdrawal features.
          appendix: 0,
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
