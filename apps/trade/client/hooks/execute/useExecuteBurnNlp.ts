import { BurnNlpParams } from '@nadohq/client';
import { useMutation } from '@tanstack/react-query';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useCallback } from 'react';

/**
 * Execute hook for burning NLP.
 *
 * Query refetches are handled by WS event listeners
 */
export function useExecuteBurnNlp() {
  const mutationFn = useExecuteInValidContext(
    useCallback(
      async (
        params: Omit<BurnNlpParams, 'subaccountName'>,
        context: ValidExecuteContext,
      ) => {
        console.log('Burning NLP', params);
        return context.nadoClient.spot.burnNlp({
          subaccountName: context.subaccount.name,
          ...params,
        });
      },
      [],
    ),
  );

  return useMutation({
    mutationFn,
    onError(error, variables) {
      logExecuteError('BurnNlp', error, variables);
    },
  });
}
