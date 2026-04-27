import { ERC20_ABI, toBigNumber } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import {
  getUsdt0SourceChainConfig,
  Usdt0SourceChainId,
} from 'client/modules/collateral/deposit/Usdt0BridgeDialog/config';
import { usePublicClient } from 'wagmi';

/**
 * Creates a query key for USDT0 allowance queries.
 */
export function usdt0AllowanceQueryKey(
  sourceChainId?: Usdt0SourceChainId,
  ownerAddress?: string,
  spenderAddress?: string,
) {
  return createQueryKey(
    'usdt0Allowance',
    sourceChainId,
    ownerAddress?.toLowerCase(),
    spenderAddress?.toLowerCase(),
  );
}

interface Params {
  /** Source chain ID. */
  sourceChainId: Usdt0SourceChainId;
}

/**
 * Query hook to fetch USDT/USDT0 allowance on the source chain.
 * Used to determine if approval is needed before bridging.
 */
export function useQueryUsdt0Allowance({ sourceChainId }: Params) {
  const {
    connectionStatus: { address },
  } = useEVMContext();
  const chainConfig = getUsdt0SourceChainConfig(sourceChainId);
  const publicClient = usePublicClient({ chainId: chainConfig.viemChain.id });
  const disabled = !address || !publicClient;

  return useQuery({
    queryKey: usdt0AllowanceQueryKey(
      sourceChainId,
      address,
      chainConfig.oftAddress,
    ),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const allowance = await publicClient.readContract({
        abi: ERC20_ABI,
        address: chainConfig.tokenAddress,
        functionName: 'allowance',
        args: [address, chainConfig.oftAddress],
      });

      return toBigNumber(allowance);
    },
    enabled: !disabled,
  });
}
