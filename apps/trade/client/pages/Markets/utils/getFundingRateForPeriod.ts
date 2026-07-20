import { FundingRates } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { FundingRatePeriod } from 'client/modules/localstorage/userState/types/userFundingRatePeriodTypes';

export function getFundingRateForPeriod(
  fundingRates: FundingRates | undefined,
  fundingRatePeriod: FundingRatePeriod,
): BigNumber | undefined {
  return fundingRates?.[fundingRatePeriod];
}
