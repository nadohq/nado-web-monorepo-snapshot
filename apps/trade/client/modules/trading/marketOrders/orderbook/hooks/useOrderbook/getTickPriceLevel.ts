import { BigNumber } from 'bignumber.js';

interface GetTickPriceLevelParams {
  isAsk: boolean;
  price: BigNumber;
  tickSpacing: number;
}

/**
 * Return the price level adjusted to the nearest tick group.
 * For asks, we round up, for bids, we round down.
 *
 * @param isAsk true if the price is for an ask, false for a bid
 * @param price original price level before grouping
 * @param tickSpacing desired grouping (tick spacing) for the price levels
 * @returns price level adjusted to the nearest tick group
 */
export function getTickPriceLevel({
  isAsk,
  price,
  tickSpacing,
}: GetTickPriceLevelParams): BigNumber {
  const distanceFromNextLowerTick = price.modulo(tickSpacing);
  if (distanceFromNextLowerTick.eq(0)) {
    // If the price is already aligned with the tick spacing, return it as is
    return price;
  }
  const lowerTickPrice = price.minus(distanceFromNextLowerTick);
  return isAsk ? lowerTickPrice.plus(tickSpacing) : lowerTickPrice;
}
