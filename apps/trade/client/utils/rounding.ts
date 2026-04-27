import { BigNumberish, toBigNumber } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';

export function roundToDecimalPlaces<T extends number | BigNumber>(
  val: T,
  decimalPlaces = 4,
  roundingMode?: BigNumber.RoundingMode,
): T {
  const rounded = toBigNumber(val).decimalPlaces(decimalPlaces, roundingMode);
  return (typeof val === 'number' ? rounded.toNumber() : rounded) as T;
}

export function roundToPrecision<T extends number | BigNumber>(
  val: T,
  significantDigits = 8,
  roundingMode?: BigNumber.RoundingMode,
): T {
  const rounded = toBigNumber(val).precision(significantDigits, roundingMode);
  return (typeof val === 'number' ? rounded.toNumber() : rounded) as T;
}

export function roundToIncrement<T extends number | BigNumber>(
  val: T,
  increment: BigNumberish | undefined,
  roundingMode?: BigNumber.RoundingMode,
): T {
  const inc = increment ? toBigNumber(increment) : undefined;

  if (!inc || inc.isZero()) {
    return val;
  }

  const rounded = toBigNumber(val)
    .div(inc)
    .dp(0, roundingMode)
    .multipliedBy(inc);
  return (typeof val === 'number' ? rounded.toNumber() : rounded) as T;
}

/**
 * @param {BigNumber.Value} val - The value to round
 * @param {number} decimals - The number of decimal places to round to
 * @param {BigNumber.RoundingMode} roundingMode - The `BigNumber` rounding mode to use
 * @returns {string}
 */
export function roundToString<T extends BigNumber.Value>(
  val: T,
  decimals: number,
  roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN,
): string {
  if (!val) {
    return '';
  }
  return toBigNumber(val).toFixed(decimals, roundingMode);
}
