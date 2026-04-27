import { toBigNumber } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { useMemo } from 'react';

export const MIN_INITIAL_DEPOSIT_VALUE = toBigNumber(5);

/**
 * This hooks returns decimal-adjusted minimum initial deposit amount by product ID
 * The minimum initial deposit amount to open a subaccount is 5 USDT worth of the product
 */
export function useMinInitialDepositAmountByProductId() {
  const { data, ...rest } = useAllMarkets();

  const mappedData = useMemo(() => {
    if (!data) {
      return;
    }
    const amountByProductId: Record<number, BigNumber> = {};

    Object.values(data.spotProducts).forEach((market) => {
      amountByProductId[market.productId] = MIN_INITIAL_DEPOSIT_VALUE.div(
        market.product.oraclePrice,
      ).precision(2, BigNumber.ROUND_UP);
    });

    return amountByProductId;
  }, [data]);

  return {
    data: mappedData,
    ...rest,
  };
}
