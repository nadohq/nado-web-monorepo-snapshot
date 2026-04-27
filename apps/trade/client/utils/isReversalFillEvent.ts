import { BigNumber } from 'bignumber.js';

/**
 * Returns true if this historical fill event (order or trade) was a reversal.
 * A reversal means the fill created a new position after closing an existing position.
 *
 * Example case:
 * 1) existing Long position 0.10 BTC
 * 2) this fill is selling 0.12 BTC
 * 3) 0.10 BTC is closed from the existing position
 * 4) remainder of the fill goes into creating a new Short 0.02 BTC
 */
export function isReversalFillEvent(
  closedBaseSize: BigNumber | undefined,
  filledBaseSize: BigNumber | undefined,
): boolean {
  if (!filledBaseSize || !closedBaseSize || closedBaseSize.isZero()) {
    return false;
  }

  // there is remainder after closing, so we opened a position on the other side.
  return closedBaseSize.lt(filledBaseSize);
}
