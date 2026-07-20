import { BigNumber } from 'bignumber.js';

type ConversionResult<T extends BigNumber | undefined> = T extends undefined
  ? undefined
  : BigNumber;

/**
 * Returns the increment rounded to 1 sd
 *
 * For xStocks, the display size/price increment is an ugly number. There are cases
 * where we only care about the relative scale of the increment.
 * @param increment
 */
export function getRoundedIncrement<T extends BigNumber | undefined>(
  increment: T,
): ConversionResult<T> {
  return increment?.sd(1) as ConversionResult<T>;
}
