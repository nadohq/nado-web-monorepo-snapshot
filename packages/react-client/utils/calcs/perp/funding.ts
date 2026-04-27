import { BigNumber } from 'bignumber.js';

export const FUNDING_RATE_PERIODS = ['1h', '4h', '8h', '1d', '1y'] as const;

export type FundingRatePeriod = (typeof FUNDING_RATE_PERIODS)[number];

export type FundingRates = Record<FundingRatePeriod, BigNumber>;

/**
 * Get a FundingRates object from a plain dailyFundingRate BigNumber
 * @param dailyFundingRate - The daily funding rate as a BigNumber
 * @returns FundingRates object with rates for different time periods (1h, 4h, 8h, 1d, 1y)
 */
export function getFundingRates(dailyFundingRate: BigNumber): FundingRates {
  return {
    '1h': dailyFundingRate.div(24),
    '4h': dailyFundingRate.div(6),
    '8h': dailyFundingRate.div(3),
    '1d': dailyFundingRate,
    '1y': dailyFundingRate.multipliedBy(365),
  } as const;
}
