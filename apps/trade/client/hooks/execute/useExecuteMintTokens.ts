import { addDecimals, QUOTE_PRODUCT_ID, toIntegerString } from '@nadohq/client';
import { useMutation } from '@tanstack/react-query';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useUpdateQueriesOnContractTransaction } from 'client/hooks/execute/util/useUpdateQueries';
import { allDepositableTokenBalancesQueryKey } from 'client/hooks/query/subaccount/useQueryAllDepositableTokenBalances';
import { useCallback } from 'react';

const UPDATE_QUERY_KEYS = [allDepositableTokenBalancesQueryKey()];

export function useExecuteMintTokens() {
  const mutationFn = useExecuteInValidContext(
    useCallback(
      async (
        params: { productId: number; tokenDecimals: number },
        context: ValidExecuteContext,
      ) => {
        const amount = params.productId === QUOTE_PRODUCT_ID ? 95 : 10;

        return context.nadoClient.spot._mintMockERC20({
          productId: params.productId,
          amount: toIntegerString(addDecimals(amount, params.tokenDecimals)),
        });
      },
      [],
    ),
  );

  const mutation = useMutation({
    mutationFn,
    onError(error, variables) {
      logExecuteError('MintTokens', error, variables);
    },
  });

  useUpdateQueriesOnContractTransaction(UPDATE_QUERY_KEYS, mutation.data);

  return mutation;
}
