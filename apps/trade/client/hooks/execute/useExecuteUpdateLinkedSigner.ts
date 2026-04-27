import {
  AccountWithPrivateKey,
  asyncResult,
  LinkSignerParams,
  subaccountToHex,
} from '@nadohq/client';
import { subaccountLinkedSignerQueryKey } from '@nadohq/react-client';
import { useMutation } from '@tanstack/react-query';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useUpdateQueries } from 'client/hooks/execute/util/useUpdateQueries';
import { useCallback } from 'react';
import { zeroAddress } from 'viem';

const UPDATE_QUERY_KEYS = [subaccountLinkedSignerQueryKey()];

interface Params {
  /** If revoking, the linked signer will be removed and set to zero address */
  revoke: boolean;
  /** If provided, uses this pre-derived signer instead of creating a new one */
  linkedSigner?: AccountWithPrivateKey;
}

/**
 * Returns the linked signer if authorizing, returns undefined if revoking
 */
type Data = AccountWithPrivateKey | undefined;

/**
 * Authorize or revoke a linked signer. When `linkedSigner` is provided,
 * uses the pre-derived signer (two-step flow). Otherwise creates a new one (single-step flow).
 */
export function useExecuteUpdateLinkedSigner() {
  const updateQueries = useUpdateQueries(UPDATE_QUERY_KEYS);

  const mutationFn = useExecuteInValidContext(
    useCallback(
      async (params: Params, context: ValidExecuteContext): Promise<Data> => {
        // Query the current linked signer, if this matches with the account, then skip authorization
        const currentLinkedSigner =
          await context.nadoClient.subaccount.getSubaccountLinkedSignerWithRateLimit(
            {
              subaccount: {
                subaccountOwner: context.subaccount.address,
                subaccountName: context.subaccount.name,
              },
            },
          );
        const currentLinkedSignerAddress =
          currentLinkedSigner.signer.toLowerCase();

        if (params.revoke) {
          if (currentLinkedSignerAddress === zeroAddress) {
            console.debug(
              '[useExecuteUpdateLinkedSigner] Skipping revoke, linked signer is zero address',
            );
            return;
          }

          await linkSignerWithReset(
            {
              signer: subaccountToHex({
                subaccountOwner: zeroAddress,
                subaccountName: '',
              }),
              subaccountName: context.subaccount.name.toString(),
            },
            context,
          );

          return;
        }

        // Use pre-derived signer if provided, otherwise create a new one
        const standardLinkedSigner =
          params.linkedSigner ??
          (await context.nadoClient.subaccount.createStandardLinkedSigner(
            context.subaccount.name,
          ));

        if (
          currentLinkedSignerAddress ===
          standardLinkedSigner.account.address.toLowerCase()
        ) {
          console.debug(
            '[useExecuteUpdateLinkedSigner] Skipping authorization, linked signer already matches',
          );
          return standardLinkedSigner;
        }

        await linkSignerWithReset(
          {
            signer: subaccountToHex({
              subaccountOwner: standardLinkedSigner.account.address,
              subaccountName: '',
            }),
            subaccountName: context.subaccount.name.toString(),
          },
          context,
        );

        return standardLinkedSigner;
      },
      [],
    ),
  );

  const mutation = useMutation({
    mutationFn,
    onSuccess() {
      updateQueries();
    },
    onError(error, variables) {
      logExecuteError('UpdateLinkedSigner', error, variables);
    },
  });

  return mutation;
}

/**
 * Wraps the linkSigner call with linked signer reset logic.
 * Before the linkSigner call, resets the linked signer to null.
 * After the call (catching any errors), restores the original linked signer.
 */
async function linkSignerWithReset(
  params: LinkSignerParams,
  context: ValidExecuteContext,
) {
  const currentLinkedSignerWalletClient =
    context.nadoClient.context.linkedSignerWalletClient;

  // Reset the linked signer to null before the call to force user to sign the transaction
  context.nadoClient.setLinkedSigner(null);
  const [result, error] = await asyncResult(
    context.nadoClient.subaccount.linkSigner(params),
  );
  context.nadoClient.setLinkedSigner(currentLinkedSignerWalletClient ?? null);

  if (error) {
    throw error;
  }
  return result;
}
