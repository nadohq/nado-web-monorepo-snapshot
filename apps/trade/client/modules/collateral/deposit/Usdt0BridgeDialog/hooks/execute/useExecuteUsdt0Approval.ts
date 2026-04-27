import { ERC20_ABI, toBigInt } from '@nadohq/client';
import { useEVMContext } from '@nadohq/react-client';
import { useMutation } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import { useUpdateQueriesOnContractTransaction } from 'client/hooks/execute/util/useUpdateQueries';
import {
  getUsdt0SourceChainConfig,
  Usdt0SourceChainId,
} from 'client/modules/collateral/deposit/Usdt0BridgeDialog/config';
import { usdt0AllowanceQueryKey } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/hooks/query/useQueryUsdt0Allowance';
import { useCallback, useMemo } from 'react';
import { useWalletClient } from 'wagmi';

interface MutationParams {
  /** Amount to approve */
  amount: BigNumber;
}

/**
 * Execute hook for USDT/USDT0 token approval on source chain.
 * Approves the OFT contract to spend the exact deposit amount.
 *
 * Note: This uses wagmi hooks directly since the approval happens on a
 * different chain than the primary chain (Ink).
 */
export function useExecuteUsdt0Approval({
  sourceChainId,
}: {
  sourceChainId: Usdt0SourceChainId;
}) {
  const {
    connectionStatus: { address },
  } = useEVMContext();
  const chainConfig = getUsdt0SourceChainConfig(sourceChainId);
  const { data: walletClient } = useWalletClient({
    chainId: chainConfig.viemChain.id,
  });

  const updateQueryKeys = useMemo(
    () => [
      usdt0AllowanceQueryKey(sourceChainId, address, chainConfig.oftAddress),
    ],
    [sourceChainId, address, chainConfig.oftAddress],
  );

  const mutationFn = useCallback(
    async ({ amount }: MutationParams) => {
      if (!address) {
        throw new Error('No connected address found');
      }
      if (!walletClient) {
        throw new Error('Wallet client not initialized');
      }

      return walletClient.writeContract({
        abi: ERC20_ABI,
        address: chainConfig.tokenAddress,
        functionName: 'approve',
        args: [chainConfig.oftAddress, toBigInt(amount)],
      });
    },
    [walletClient, address, chainConfig],
  );

  const mutation = useMutation({
    mutationFn,
    onError(error, variables) {
      logExecuteError('Usdt0Approval', error, variables);
    },
  });

  useUpdateQueriesOnContractTransaction(updateQueryKeys, mutation.data);

  return mutation;
}
