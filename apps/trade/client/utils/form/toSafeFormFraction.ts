import { BigNumber } from 'bignumber.js';
import { roundToDecimalPlaces } from 'client/utils/rounding';

/**
 * A form util that creates a safe fraction (0 → 1) and guarding against div by zero
 * @param numerator
 * @param denominator
 */
export function toSafeFormFraction(
  numerator: BigNumber | undefined,
  denominator: BigNumber | undefined,
) {
  if (!numerator || !denominator || denominator.isZero()) {
    return 0;
  }

  const fraction = roundToDecimalPlaces(
    numerator.div(denominator),
    4,
  ).toNumber();

  if (fraction < 0 || fraction > 1) {
    // Instead of clamping high fractions to 1, return 0 to effectively reset invalid input.
    // This is to fix a case where if we return 1, and the user clicks "Max", there will be no UI update because the fraction form value stays at 1
    return 0;
  }

  return fraction;
}
