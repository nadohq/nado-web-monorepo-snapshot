import { BigNumber } from 'bignumber.js';
import { useMemo } from 'react';
import { useQuerySymbols } from '../query/useQuerySymbols';

/**
 * Retrieves xStocks exchange rate by product ID, or null if not applicable
 */
export function useXStocksExchangeRates() {
  const { data, ...rest } = useQuerySymbols();

  const mappedData = useMemo(():
    | Record<number, BigNumber | null>
    | undefined => {
    if (!data) {
      return undefined;
    }

    const exchangeRates: Record<number, BigNumber | null> = {};

    Object.values(data).forEach(({ productId, exchangeRate }) => {
      exchangeRates[productId] = exchangeRate;
    });

    return exchangeRates;
  }, [data]);

  return {
    data: mappedData,
    ...rest,
  };
}
