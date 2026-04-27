/**
 * Updates the number of total referrals available for a user.
 * Will generate a new referral code if the user does not have one.
 */
export interface UpdateFuulReferralCodeParams {
  address: string;
}

export interface UpdateFuulReferralCodeResponse {
  /**
   * Number of new referrals added
   */
  numReferralsAdded: number;
}
