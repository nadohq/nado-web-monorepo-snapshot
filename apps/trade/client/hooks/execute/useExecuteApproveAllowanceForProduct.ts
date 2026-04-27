import { ApproveAllowanceParams, toPrintableObject } from '@nadohq/client';
import { useMutation } from '@tanstack/react-query';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useUpdateQueriesOnContractTransaction } from 'client/hooks/execute/util/useUpdateQueries';
import { tokenAllowanceQueryKey } from 'client/hooks/query/collateral/useQueryTokenAllowance';
import { useCallback, useState } from 'react';

/**
 * Approve allowance for Nado's Endpoint contract to spend a token corresponding to a spot product ID
 */
export function useExecuteApproveAllowanceForProduct() {
  // Default the query key to the most generic "catch-all", this state should be updated during the mutation
  const [refetchQueryKeys, setRefetchQueryKeys] = useState<string[][]>([
    tokenAllowanceQueryKey(),
  ]);

  const mutationFn = useExecuteInValidContext(
    useCallback(
      async (params: ApproveAllowanceParams, context: ValidExecuteContext) => {
        console.log('Approve Allowance for Product', toPrintableObject(params));

        setRefetchQueryKeys([
          tokenAllowanceQueryKey(
            context.subaccount.chainEnv,
            context.subaccount.address,
            context.nadoClient.context.contractAddresses.endpoint,
            // Omit the token address as `params` contains a product ID, and it's a separate async call / query to retrieve the token address
            // This can be a point of future improvement
          ),
        ]);

        return context.nadoClient.spot.approveAllowance(params);
      },
      [],
    ),
  );

  const mutation = useMutation({
    mutationFn,
    onError(error, variables) {
      logExecuteError('ApproveAllowance', error, variables);
    },
  });

  useUpdateQueriesOnContractTransaction(refetchQueryKeys, mutation.data);

  return mutation;
}
