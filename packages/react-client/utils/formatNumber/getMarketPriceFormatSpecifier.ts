import { BigNumber } from 'bignumber.js';
import { precisionFixed } from 'd3-format';
import { PresetNumberFormatSpecifier } from './NumberFormatSpecifier';

/**
 * Creates a format specifier based on the given price increment.
 * If no price increment is given, defaults to 0 decimal places (integer)
 * @param priceIncrement
 * @param isSigned
 */
export function getMarketPriceFormatSpecifier(
  priceIncrement?: BigNumber,
  isSigned?: boolean,
) {
  if (!priceIncrement || priceIncrement.isZero() || priceIncrement.gte(1)) {
    return isSigned
      ? PresetNumberFormatSpecifier.SIGNED_NUMBER_INT
      : PresetNumberFormatSpecifier.NUMBER_INT;
  }

  const precision = precisionFixed(priceIncrement.toNumber()).toFixed();
  return isSigned ? `+.${precision}f` : `.${precision}f`;
}
