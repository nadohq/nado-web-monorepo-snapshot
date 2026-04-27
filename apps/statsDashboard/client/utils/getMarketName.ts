import { EdgeAnnotatedMarket } from 'client/hooks/types';

/**
 * Returns the market name. Chain name is omitted from the display
 * since we currently only operate on a single chain, but the underlying
 * data model retains multi-chain support for future use.
 */
export function getMarketName(market: EdgeAnnotatedMarket) {
  return market.metadata.marketName;
}
