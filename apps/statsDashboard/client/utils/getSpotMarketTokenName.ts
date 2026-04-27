import { EdgeAnnotatedSpotMarket } from 'client/hooks/types';

/**
 * Returns the spot market token symbol. Chain name is omitted from the display
 * since we currently only operate on a single chain, but the underlying
 * data model retains multi-chain support for future use.
 */
export function getSpotMarketTokenName(market: EdgeAnnotatedSpotMarket) {
  return market.metadata.token.symbol;
}
