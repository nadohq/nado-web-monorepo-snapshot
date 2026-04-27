import { BigNumbers } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';

interface Params {
  // Amount of USDT0 balance for the iso position
  totalMargin: BigNumber;
  vQuoteBalance: BigNumber;
  // Notional value of the position, with sign (positive for long, negative for short)
  positionNotionalValueWithSign: BigNumber;
}

/**
 * Calculates leverage by solving for a "weight" that makes the current health 0
 * totalMargin + vQuoteBalance + positionNotionalValueWithSign * x = 0, and use abs(1 / (1 - x)) as leverage
 */
export function calcIsoPositionLeverage(params: Params) {
  const { totalMargin, vQuoteBalance, positionNotionalValueWithSign } = params;

  // Solve for x in: totalMargin + vQuoteBalance + positionNotionalValue * x = 0
  // => x = -(totalMargin + vQuoteBalance) / positionNotionalValueWithSign
  const x = totalMargin
    .plus(vQuoteBalance)
    .negated()
    .dividedBy(positionNotionalValueWithSign);

  // Leverage = abs(1 / (1 - x))
  return BigNumbers.ONE.dividedBy(BigNumbers.ONE.minus(x)).abs();
}
