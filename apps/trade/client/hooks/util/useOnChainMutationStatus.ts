import { MutationStatus } from '@tanstack/react-query';
import { useQueryOnChainTransactionState } from 'client/hooks/query/useQueryOnChainTransactionState';
import { useEffect } from 'react';

interface Params {
  mutationStatus: MutationStatus;
  txHash: string | undefined;
}

/**
 * Util hook for mutations where the tx goes on-chain, in which case the "loading" state also needs
 * to include the time it takes for the tx to be confirmed.
 */
export function useOnChainMutationStatus({ mutationStatus, txHash }: Params) {
  const onChainState = useQueryOnChainTransactionState({
    txHash,
  });

  const onChainError = onChainState.error;

  useEffect(() => {
    if (onChainError) {
      console.error('[useOnChainMutationStatus] on-chain error', onChainError);
    }
  }, [onChainError]);

  return {
    isLoading: mutationStatus === 'pending' || onChainState.type === 'pending',
    isSuccess: onChainState.type === 'confirmed',
  };
}
