import { useMutation } from '@tanstack/react-query';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useUpdateQueriesOnContractTransaction } from 'client/hooks/execute/util/useUpdateQueries';
import { paginatedSubaccountCollateralEventsQueryKey } from 'client/hooks/query/subaccount/usePaginatedSubaccountCollateralEvents';
import { allProductsWithdrawPoolLiquidityQueryKey } from 'client/hooks/query/withdrawPool/useQueryAllProductsWithdrawPoolLiquidity';
import { markedWithdrawPoolIdxsQueryKey } from 'client/hooks/query/withdrawPool/useQueryMarkedWithdrawPoolIdxs';
import { useCallback } from 'react';

const UPDATE_QUERY_KEYS = [
  paginatedSubaccountCollateralEventsQueryKey(),
  markedWithdrawPoolIdxsQueryKey(),
  allProductsWithdrawPoolLiquidityQueryKey(),
];

export function useExecuteFastWithdrawal() {
  const mutationFn = useExecuteInValidContext(
    useCallback(
      async (
        params: { submissionIndex: string },
        context: ValidExecuteContext,
      ) => {
        console.log('Fast Withdrawing', params);

        // There might be delay until the tx is signed (< 5s). This might fail before.
        const { idx, txBytes, signatures } =
          await context.nadoClient.context.indexerClient.getFastWithdrawalSignature(
            { idx: params.submissionIndex },
          );

        return context.nadoClient.context.contracts.withdrawPool.write.submitFastWithdrawal(
          [idx, txBytes, signatures],
        );
      },
      [],
    ),
  );

  const mutation = useMutation({
    mutationFn,
    onError(error, variables) {
      logExecuteError('FastWithdrawal', error, variables);
    },
  });

  useUpdateQueriesOnContractTransaction(UPDATE_QUERY_KEYS, mutation.data);

  return mutation;
}
