import { BigNumberish, toBigNumber } from '@nadohq/client';

/**
 * @param value
 * @param threshold
 * Checks if the value is roughly zero, returning true if it is, false otherwise
 * @returns boolean
 */
export function isRoughlyZero(value: BigNumberish, threshold = 1e-6) {
  return toBigNumber(value).abs().lt(threshold);
}
