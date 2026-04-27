import { AccountWithPrivateKey } from '@nadohq/client';
import { useMutation } from '@tanstack/react-query';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useCallback } from 'react';
import { EmptyObject } from 'type-fest';

/**
 * Creates the linked signer key (requires a wallet signature).
 */
export function useExecuteCreateLinkedSignerKey() {
  const mutationFn = useExecuteInValidContext(
    useCallback(
      async (
        _params: EmptyObject,
        context: ValidExecuteContext,
      ): Promise<AccountWithPrivateKey> => {
        // Create the linked signer, this requires a signature
        const standardLinkedSigner =
          await context.nadoClient.subaccount.createStandardLinkedSigner(
            context.subaccount.name,
          );

        return standardLinkedSigner;
      },
      [],
    ),
  );

  return useMutation({
    mutationFn,
    onError(error) {
      logExecuteError('CreateLinkedSignerKey', error, undefined);
    },
  });
}
