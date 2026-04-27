import { QueryDisabledError, useEVMContext } from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { useGetConfirmedTx } from 'client/hooks/util/useGetConfirmedTx';
import { useMemo } from 'react';
import { TransactionReceipt } from 'viem';

interface Params {
  txHash: string | undefined;
}

type UseQueryOnChainTransactionState =
  | {
      type: 'idle';
      receipt: undefined;
      error: undefined;
    }
  | {
      type: 'pending';
      receipt: undefined;
      error: undefined;
    }
  | {
      type: 'confirmed';
      receipt: TransactionReceipt;
      error: undefined;
    }
  | {
      type: 'error';
      receipt: undefined;
      error?: unknown;
    };

export function useQueryOnChainTransactionState({
  txHash,
}: Params): UseQueryOnChainTransactionState {
  const {
    chainStatus: { connectedChain },
  } = useEVMContext();
  const getConfirmedTx = useGetConfirmedTx();

  const disabled = !txHash || !connectedChain;
  const { data, error, isLoading } = useQuery({
    queryKey: ['onChainTransactionState', connectedChain?.id, txHash],
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      return getConfirmedTx(Promise.resolve(txHash));
    },
    enabled: !disabled,
  });

  return useMemo((): UseQueryOnChainTransactionState => {
    if (data) {
      // getConfirmedTx checks for a `success` `status`, so no need to check data.status here
      return {
        type: 'confirmed',
        receipt: data.transactionReceipt,
        error: undefined,
      };
    } else if (isLoading) {
      return {
        type: 'pending',
        receipt: undefined,
        error: undefined,
      };
    } else if (error) {
      return {
        type: 'error',
        receipt: undefined,
        error,
      };
    } else {
      return {
        type: 'idle',
        error: undefined,
        receipt: undefined,
      };
    }
  }, [data, error, isLoading]);
}
