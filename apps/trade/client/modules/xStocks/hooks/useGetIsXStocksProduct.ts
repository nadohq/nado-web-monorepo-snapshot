import { useXStocksExchangeRates } from '@nadohq/react-client';
import { useCallback } from 'react';

/**
 * Returns a stable getter that reports whether a product is an xStocks market.
 *
 * xStocks-ness is derived from the backend signal directly: the symbols query
 * provides an exchange rate for xStocks markets and `null` for all others. This
 * is authoritative even when an xStock's exchange rate happens to equal 1, which
 * a value-based check could not distinguish from a non-xStocks market.
 *
 * Until the exchange rates query has resolved, every product reports `false`.
 */
export function useGetIsXStocksProduct(): (
  productId: number | undefined,
) => boolean {
  const { data: exchangeRates } = useXStocksExchangeRates();

  return useCallback(
    (productId: number | undefined) =>
      productId != null && exchangeRates?.[productId] != null,
    [exchangeRates],
  );
}
