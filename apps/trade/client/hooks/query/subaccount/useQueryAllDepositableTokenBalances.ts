import {
  ChainEnv,
  ERC20_ABI,
  getValidatedAddress,
  NLP_PRODUCT_ID,
  toBigNumber,
} from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainPublicClient,
} from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { QueryState } from 'client/types/QueryState';
import { useMemo } from 'react';

export function allDepositableTokenBalancesQueryKey(
  chainEnv?: ChainEnv,
  owner?: string,
  productIds?: number[],
) {
  return createQueryKey('allTokenBalances', chainEnv, owner, productIds);
}

/**
 * Product ID -> balance
 */
type Data = Record<number, BigNumber>;

/**
 * Retrieve all on-chain token balances using viem/wagmi's multicall functionality.
 * We ideally limit usages of viem but multicall is much more efficient & faster than using a `Promise.all` on
 * individual `IERC20` calls.
 */
export function useQueryAllDepositableTokenBalances(): QueryState<Data> {
  const publicClient = usePrimaryChainPublicClient();
  const {
    connectionStatus: { address },
    primaryChainEnv,
  } = useEVMContext();
  const { data: allMarkets } = useAllMarkets();

  const spotProducts = useMemo(() => {
    return Object.values(allMarkets?.spotProducts ?? {});
  }, [allMarkets?.spotProducts]);
  const disabled = !spotProducts.length || !address || !publicClient;

  const queryFn = async (): Promise<Data | undefined> => {
    if (disabled) {
      throw new QueryDisabledError();
    }

    const multicallResult = await publicClient.multicall({
      // In case of failure, default to 0
      // Return type depends on this flag
      allowFailure: true,
      contracts: spotProducts
        .map((spotProduct) => {
          // NLP is non-depositable and non-withdrawable
          if (spotProduct.productId === NLP_PRODUCT_ID) {
            return;
          }

          return {
            functionName: 'balanceOf',
            address: getValidatedAddress(spotProduct.product.tokenAddr),
            abi: ERC20_ABI,
            args: [address],
          };
        })
        .filter(nonNullFilter),
    });

    const productIdToBalance: Data = {};

    multicallResult.map(({ error, result, status }, index) => {
      const productId = spotProducts[index].productId;
      if (status !== 'success') {
        console.warn(`Error fetching balance for product ${productId}`, error);
      }

      const tokenBalance = (result as bigint) ?? BigInt(0);
      productIdToBalance[productId] = toBigNumber(tokenBalance);
    });

    return productIdToBalance;
  };

  return useQuery({
    queryKey: allDepositableTokenBalancesQueryKey(
      primaryChainEnv,
      address,
      spotProducts.map((p) => p.productId),
    ),
    queryFn,
    enabled: !disabled,
    // We still need refetch here as there can be external events that change wallet balances
    refetchInterval: 10000,
  });
}
