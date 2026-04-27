import {
  calcBorrowRateForTimeRange,
  calcRealizedDepositRateForTimeRange,
  NLP_PRODUCT_ID,
  TimeInSeconds,
} from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { useMemo } from 'react';
/**
 * Rates are represented as an annualized APY in fractional form
 */
export interface SpotInterestRate {
  deposit: BigNumber;
  borrow: BigNumber;
}

/**
 * Returns a mapping of product ID -> interest rates for quote + spot markets
 */
export function useSpotInterestRates() {
  const { data: allMarkets } = useAllMarkets();

  const data = useMemo(() => {
    if (!allMarkets) {
      return;
    }

    const rates: Record<number, SpotInterestRate> = {};
    Object.values(allMarkets.spotProducts).forEach(({ product }) => {
      // NLP product does not have a deposit/borrow rate
      if (product.productId === NLP_PRODUCT_ID) {
        return;
      }

      const minDepositRate = product.minDepositRate;

      rates[product.productId] = {
        deposit: calcRealizedDepositRateForTimeRange(
          product,
          TimeInSeconds.YEAR,
          0.2,
          minDepositRate,
        ),
        borrow: calcBorrowRateForTimeRange(
          product,
          TimeInSeconds.YEAR,
          minDepositRate,
        ),
      };
    });

    return rates;
  }, [allMarkets]);

  return {
    data,
  };
}
