import { ChainEnv, QUOTE_PRODUCT_ID, toBigNumber } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';

export function allProductsWithdrawPoolLiquidityQueryKey(
  chainEnv?: ChainEnv,
  productIds?: number[],
) {
  return createQueryKey(
    'allProductsWithdrawPoolLiquidity',
    chainEnv,
    productIds,
  );
}

/**
 * The liquidity available in the withdraw pool for each product.
 * @returns a map of productId to liquidity amount in token decimals.
 */
export function useQueryAllProductsWithdrawPoolLiquidity() {
  const { primaryChainEnv } = useEVMContext();
  const nadoClient = usePrimaryChainNadoClient();
  const { data: allMarketsStaticData } = useAllMarketsStaticData();

  const productIds = allMarketsStaticData
    ? [QUOTE_PRODUCT_ID, ...allMarketsStaticData.spotMarketsProductIds]
    : undefined;

  const disabled = !nadoClient || !productIds;

  return useQuery({
    queryKey: allProductsWithdrawPoolLiquidityQueryKey(
      primaryChainEnv,
      productIds,
    ),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      const baseResponse =
        await nadoClient.context.contracts.withdrawPool.read.checkProductBalances(
          [productIds],
        );

      const withdrawPoolLiquidityByProductId: Record<number, BigNumber> = {};

      productIds.forEach((productId, index) => {
        withdrawPoolLiquidityByProductId[productId] = toBigNumber(
          baseResponse[index],
        );
      });

      return withdrawPoolLiquidityByProductId;
    },
    enabled: !disabled,
    refetchInterval: 10000,
  });
}
