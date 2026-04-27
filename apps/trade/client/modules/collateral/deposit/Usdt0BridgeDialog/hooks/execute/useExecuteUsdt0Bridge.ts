import { useEVMContext } from '@nadohq/react-client';
import { useMutation } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import { useUpdateQueriesOnContractTransaction } from 'client/hooks/execute/util/useUpdateQueries';
import { oftAbi } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/abi';
import {
  getUsdt0SourceChainConfig,
  Usdt0SourceChainId,
} from 'client/modules/collateral/deposit/Usdt0BridgeDialog/config';
import { usdt0AllowanceQueryKey } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/hooks/query/useQueryUsdt0Allowance';
import { buildOftSendParam } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/utils';
import { tokenBalanceQueryKey } from 'client/modules/collateral/deposit/hooks/query/useQueryTokenBalance';
import { useCallback, useMemo } from 'react';
import { Address } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

interface ExecuteUsdt0BridgeParams {
  /** Amount to bridge */
  amount: BigNumber;
  /** Destination address on Ink. */
  destinationAddress: Address;
}

/**
 * Execute hook for USDT0 bridge operations via LayerZero OFT.
 * Initiates the cross-chain transfer from source chain to Ink.
 *
 * Note: This uses wagmi hooks directly since the bridge transaction
 * happens on the source chain (not Ink).
 */
export function useExecuteUsdt0Bridge({
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
  const publicClient = usePublicClient({ chainId: chainConfig.viemChain.id });

  const updateQueryKeys = useMemo(
    () => [
      tokenBalanceQueryKey(
        chainConfig.viemChain.id,
        address,
        chainConfig.tokenAddress,
      ),
      usdt0AllowanceQueryKey(sourceChainId, address, chainConfig.oftAddress),
    ],
    [
      chainConfig.viemChain.id,
      chainConfig.tokenAddress,
      chainConfig.oftAddress,
      address,
      sourceChainId,
    ],
  );

  const mutationFn = useCallback(
    async (params: ExecuteUsdt0BridgeParams): Promise<string> => {
      if (!address) {
        throw new Error('No connected address found');
      }
      if (!publicClient) {
        throw new Error('Public client not initialized');
      }
      if (!walletClient) {
        throw new Error('Wallet client not initialized');
      }

      const sendParam = buildOftSendParam({
        amountWithDecimals: params.amount,
        destinationAddress: params.destinationAddress,
      });

      const messagingFee = await publicClient.readContract({
        address: chainConfig.oftAddress,
        abi: oftAbi,
        functionName: 'quoteSend',
        args: [sendParam, false],
      });

      return walletClient.writeContract({
        address: chainConfig.oftAddress,
        abi: oftAbi,
        functionName: 'send',
        args: [
          sendParam,
          {
            nativeFee: messagingFee.nativeFee,
            lzTokenFee: messagingFee.lzTokenFee,
          },
          address,
        ],
        value: messagingFee.nativeFee,
      });
    },
    [walletClient, publicClient, address, chainConfig],
  );

  const mutation = useMutation({
    mutationFn,
    onError(error, variables) {
      logExecuteError('Usdt0Bridge', error, variables);
    },
  });

  useUpdateQueriesOnContractTransaction(updateQueryKeys, mutation.data);

  return mutation;
}
