import { toBigNumber } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';

const DAYS_IN_YEAR = 365;

/**
 * Calculates the annualized interest rate from a given daily interest rate.
 *
 * @param {BigNumber | undefined} dailyRate - The daily interest rate as a BigNumber.
 * @returns {BigNumber} The annualized interest rate as a BigNumber.
 */
export function calcAnnualizedInterestRate(dailyRate: BigNumber | undefined) {
  if (dailyRate === undefined) {
    return;
  }
  // Convert to number for this, with some loss of precision, but using .pow() causes us to hit browser resource limits.
  return toBigNumber(dailyRate.plus(1).toNumber() ** DAYS_IN_YEAR - 1);
}
