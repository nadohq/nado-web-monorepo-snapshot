import { BigNumberish, toBigNumber } from '@nadohq/client';

/**
 * Validator that asserts the value is in increments of the given increment, uses BigNumber to avoid fp errors
 * @param val The value to validate
 * @param increment The increment to validate against
 * @returns True if the value is a valid increment, false otherwise
 */
export function isValidIncrementAmount(
  val: BigNumberish,
  increment: BigNumberish,
): boolean {
  return toBigNumber(val).mod(toBigNumber(increment)).eq(0);
}
