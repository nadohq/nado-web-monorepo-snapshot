import { ERC20_ABI, toBigNumber } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { usePublicClient } from 'wagmi';

export function tokenBalanceQueryKey(
  chainId?: number,
  accountAddress?: string,
  tokenAddress?: string,
) {
  return createQueryKey(
    'tokenBalance',
    chainId,
    accountAddress?.toLowerCase(),
    tokenAddress?.toLowerCase(),
  );
}

interface Params {
  /** Chain ID to check balance on. */
  chainId: number;
  /** Token contract address on the chain. */
  tokenAddress: Address;
}

/**
 * Query hook to fetch an ERC-20 token balance on a given chain.
 * Uses TanStack Query for caching and automatic refetching.
 */
export function useQueryTokenBalance({ chainId, tokenAddress }: Params) {
  const {
    connectionStatus: { address },
  } = useEVMContext();
  const publicClient = usePublicClient({ chainId });

  const disabled = !address || !publicClient;

  return useQuery({
    queryKey: tokenBalanceQueryKey(chainId, address, tokenAddress),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const balance = await publicClient.readContract({
        abi: ERC20_ABI,
        address: tokenAddress,
        functionName: 'balanceOf',
        args: [address],
      });

      return toBigNumber(balance);
    },
    enabled: !disabled,
    refetchInterval: 10000,
  });
}
