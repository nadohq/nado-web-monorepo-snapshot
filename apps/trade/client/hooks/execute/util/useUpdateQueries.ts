import { SetTimeoutReturnType } from '@nadohq/web-common';
import { RefetchOptions, useQueryClient } from '@tanstack/react-query';
import { useQueryOnChainTransactionState } from 'client/hooks/query/useQueryOnChainTransactionState';
import { useEffect } from 'react';

interface UpdateQueriesParams extends Pick<RefetchOptions, 'cancelRefetch'> {
  /**
   * Delay in milliseconds before updating the queries.
   */
  afterMillis?: number;
}

/**
 * Updates query data after a delay by invalidating the queries.
 *
 * @param queryKeys
 * @param params
 */
export function useUpdateQueries(
  queryKeys: unknown[][],
  params?: UpdateQueriesParams,
) {
  const queryClient = useQueryClient();
  const { cancelRefetch, afterMillis = 200 } = params ?? {};

  return () => {
    return setTimeout(() => {
      queryKeys.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey }, { cancelRefetch });
      });
    }, afterMillis);
  };
}

/**
 * Updates query data when a contract transaction is confirmed.
 *
 * @param queryKeys must be stable (i.e. a const or a memoized value)
 * @param txHash
 * @param params
 */
export function useUpdateQueriesOnContractTransaction(
  queryKeys: unknown[][],
  txHash: string | undefined,
  params?: UpdateQueriesParams,
) {
  const queryClient = useQueryClient();
  const {
    cancelRefetch,
    // Use a relatively high delay as on-chain txs take a bit to finalize
    afterMillis = 3000,
  } = params ?? {};

  const { type } = useQueryOnChainTransactionState({
    txHash,
  });

  useEffect(() => {
    let timeout: SetTimeoutReturnType;

    if (type === 'confirmed') {
      timeout = setTimeout(() => {
        queryKeys.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey }, { cancelRefetch });
        });
      }, afterMillis);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [afterMillis, cancelRefetch, queryClient, queryKeys, type]);
}
