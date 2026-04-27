import { BigNumber } from 'bignumber.js';

/**
 * Referral data from the Fuul SDK
 */
export interface AddressFuulReferralRewards {
  address: string;
  totalEarnedUsdt: BigNumber;
  /**
   * This is null for new users - they're not on the leaderboard yet
   */
  rank: number | null;
  referredVolumeUsdt: BigNumber;
  numReferredUsers: number;
}

/**
 * Claimable and claimed referral rewards from an onchain query
 */
export interface OnChainFuulReferralRewardsBalance {
  availableToClaim: BigNumber;
  claimed: BigNumber;
}

/**
 * Return type from the subgraph query
 */
export interface GraphUserFuulReferralRewardsBalance {
  availableToClaim: string;
  claimed: string;
}
