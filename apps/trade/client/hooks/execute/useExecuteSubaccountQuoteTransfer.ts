import { TransferQuoteParams } from '@nadohq/client';
import {
  getWalletClientForLinkedSignerAccount,
  SubaccountSigningPreference,
} from '@nadohq/react-client';
import { useMutation } from '@tanstack/react-query';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useCallback } from 'react';
import { Chain } from 'viem/chains';

interface MutationFnParams extends Pick<
  TransferQuoteParams,
  'subaccountName' | 'recipientSubaccountName' | 'amount'
> {
  senderSigningPreference: SubaccountSigningPreference | undefined;
}

/**
 * Execute hook for transferring funds between subaccounts.
 *
 * Query refetches are handled by WS event listeners
 */
export function useExecuteSubaccountQuoteTransfer() {
  const mutationFn = useExecuteInValidContext(
    useCallback(
      async (params: MutationFnParams, context: ValidExecuteContext) => {
        console.log('Initiating subaccount quote transfer', params);

        // This is a hack, but we need a way to pass the saved linked signer
        // (or `null` if there is none) for the sender subaccount when it's not
        // the current subaccount.
        //
        // So here, we grab the saved linked signer for the sender and set it
        // manually, which also allows us to avoid `LinkedSignerSync` from running.
        // Then, after the transfer, we set it back to the current subaccount's.
        //
        // If the sender is the current subaccount, it's basically a no-op.
        const currentLinkedSignerWalletClient =
          context.nadoClient.context.linkedSignerWalletClient;
        context.nadoClient.setLinkedSigner(
          getLinkedSignerWalletClient(
            params.senderSigningPreference,
            context.walletClient.chain,
          ),
        );

        try {
          return await context.nadoClient.spot.transferQuote(params);
        } catch (e) {
          throw e;
        } finally {
          context.nadoClient.setLinkedSigner(
            currentLinkedSignerWalletClient ?? null,
          );
        }
      },
      [],
    ),
  );

  const mutation = useMutation({
    mutationFn,
    onError(error, variables) {
      logExecuteError('QuoteTransfer', error, variables);
    },
  });

  return mutation;
}

function getLinkedSignerWalletClient(
  signingPreference: SubaccountSigningPreference | undefined,
  chain: Chain,
) {
  if (
    signingPreference?.type === 'sign_once' &&
    signingPreference.linkedSigner
  ) {
    return getWalletClientForLinkedSignerAccount(
      signingPreference.linkedSigner.account,
      chain,
    );
  }

  return null;
}
