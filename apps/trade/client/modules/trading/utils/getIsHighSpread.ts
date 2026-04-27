import { BigNumber } from 'bignumber.js';

/**
 * Spread > 1% is abnormally high
 * @param spreadFrac
 */
export function getIsHighSpread(spreadFrac: BigNumber) {
  return spreadFrac.gt(0.01);
}
