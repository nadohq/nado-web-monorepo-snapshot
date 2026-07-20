import { BigNumbers } from '@nadohq/client';
import { useXStocksExchangeRates } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useCallback } from 'react';

interface UseGetXStocksExchangeRate {
  getExchangeRate: (productId: number | undefined) => BigNumber;
  /**
   * True once the exchange rates query has resolved at least once.
   * Until then, getExchangeRate returns BigNumber(1) as a safe fallback.
   */
  hasLoaded: boolean;
}

/**
 * Returns a stable getter and a loaded flag for xStocks exchange rates.
 *
 * For xStocks markets, getExchangeRate returns the exchange rate from the backend query.
 *
 * For all other markets, returns BigNumber(1) so conversion utilities
 * become no-ops and callers require no xStocks-specific guards.
 */
export function useGetXStocksExchangeRate(): UseGetXStocksExchangeRate {
  const { data: exchangeRates } = useXStocksExchangeRates();

  const getExchangeRate = useCallback(
    (productId: number | undefined) => {
      if (productId == null) {
        return BigNumbers.ONE;
      }
      return exchangeRates?.[productId] ?? BigNumbers.ONE;
    },
    [exchangeRates],
  );

  return {
    getExchangeRate,
    hasLoaded: exchangeRates !== undefined,
  };
}
