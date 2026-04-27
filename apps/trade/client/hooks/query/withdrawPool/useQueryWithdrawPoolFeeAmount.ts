import { ChainEnv, toBigInt, toBigNumber } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { getStaticMarketDataForProductId } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/getStaticMarketDataForProductId';
import { SpotStaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';

export function withdrawPoolFeeAmountQueryKey(
  chainEnv?: ChainEnv,
  productId?: number,
  amount?: BigNumber,
) {
  return createQueryKey('withdrawPoolFeeAmount', chainEnv, productId, amount);
}

interface Params {
  productId: number | undefined;
  amount: BigNumber | undefined;
}

/**
 * Calculates the fee amount for withdrawing from the pool.
 * @returns fee amount in token decimals.
 */
export function useQueryWithdrawPoolFeeAmount({ productId, amount }: Params) {
  const { primaryChainEnv } = useEVMContext();
  const nadoClient = usePrimaryChainNadoClient();
  const { data: allMarketsStaticData } = useAllMarketsStaticData();

  const disabled = !nadoClient || productId == null || !amount;

  return useQuery({
    queryKey: withdrawPoolFeeAmountQueryKey(primaryChainEnv, productId, amount),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const tokenAddress =
        getStaticMarketDataForProductId<SpotStaticMarketData>(
          productId,
          allMarketsStaticData,
        )?.metadata.token.address;

      if (!tokenAddress) {
        throw new Error(
          '[useQueryWithdrawPoolFeeAmount] Token address not found',
        );
      }

      const baseResponse =
        await nadoClient.context.contracts.withdrawPool.read.fastWithdrawalFeeAmount(
          [tokenAddress, productId, toBigInt(amount)],
        );

      return toBigNumber(baseResponse);
    },
    enabled: !disabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
