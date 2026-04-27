import { BigNumbers } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';

/**
 * Calculate change frac as defined by (new - old) / old, but defaults to using the new value if the old value is 0
 * If both values are zero, then zero is returned
 *
 * @param newValue
 * @param oldValue
 */
export function calcChangeFrac(newValue: BigNumber, oldValue: BigNumber) {
  const diff = newValue.minus(oldValue);
  if (!oldValue.isZero()) {
    return diff.dividedBy(oldValue);
  }
  if (!newValue.isZero()) {
    return diff.dividedBy(newValue);
  }
  return BigNumbers.ZERO;
}
