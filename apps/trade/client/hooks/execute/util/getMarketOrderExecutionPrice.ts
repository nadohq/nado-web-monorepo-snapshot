import { LatestMarketPrice } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';

interface Params {
  isBuy: boolean;
  marketSlippageFraction: number;
  latestMarketPrices: LatestMarketPrice | undefined;
}

/**
 * Get the execution price for a market order with the configured slippage.
 * Standardized on `isBuy` to match `getOrderSlippageMultiplier` and the
 * rest of the order-side helpers.
 */
export function getMarketOrderExecutionPrice({
  isBuy,
  marketSlippageFraction,
  latestMarketPrices,
}: Params) {
  // Apply the slippage on the top-of-book price to ensure spread is included in price with slippage
  return isBuy
    ? latestMarketPrices?.safeBid?.times(1 + marketSlippageFraction)
    : latestMarketPrices?.safeAsk?.times(1 - marketSlippageFraction);
}
