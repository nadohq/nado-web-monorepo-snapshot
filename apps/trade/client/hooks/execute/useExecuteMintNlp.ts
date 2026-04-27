import { MintNlpParams } from '@nadohq/client';
import { useMutation } from '@tanstack/react-query';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useCallback } from 'react';

/**
 * Execute hook for minting NLP.
 *
 * Query refetches are handled by WS event listeners
 */
export function useExecuteMintNlp() {
  const mutationFn = useExecuteInValidContext(
    useCallback(
      async (
        params: Omit<MintNlpParams, 'subaccountName'>,
        context: ValidExecuteContext,
      ) => {
        console.log('Minting NLP', params);
        return context.nadoClient.spot.mintNlp({
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
      logExecuteError('MintNlp', error, variables);
    },
  });
}
