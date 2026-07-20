import { useQuerySubaccountFeeRates } from 'client/hooks/query/subaccount/useQuerySubaccountFeeRates';
import { useCallback } from 'react';

export function useGetIsZeroFeesMarketForSubaccount() {
  const { data: subaccountFeeRates } = useQuerySubaccountFeeRates();

  return {
    getIsZeroFeesMarketForSubaccount: useCallback(
      (productId: number): boolean => {
        const makerFeeRate = subaccountFeeRates?.orders[productId]?.maker;
        const takerFeeRate = subaccountFeeRates?.orders[productId]?.taker;
        if (makerFeeRate === undefined || takerFeeRate === undefined) {
          return false;
        }
        return makerFeeRate.isZero() && takerFeeRate.isZero();
      },
      [subaccountFeeRates],
    ),
  };
}
