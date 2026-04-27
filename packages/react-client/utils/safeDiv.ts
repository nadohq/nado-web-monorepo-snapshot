import { BigNumbers } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';

/**
 * Util to safely divide two numbers or BigNumbers.
 * @param denominator
 * @param numerator
 * @returns A number or BigNumber based on the input's type.
 */
export function safeDiv<TValue extends number | BigNumber>(
  numerator: TValue,
  denominator: TValue,
): TValue {
  // The casts below are safe because type(numerator) === type(denominator)
  if (typeof denominator === 'number') {
    const typedNumerator = numerator as number;

    return (denominator === 0 ? 0 : typedNumerator / denominator) as TValue;
  }

  const typedNumerator = numerator as BigNumber;

  return (
    denominator.isZero() ? BigNumbers.ZERO : typedNumerator.div(denominator)
  ) as TValue;
}
