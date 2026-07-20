/**
 * Gets the user's referral code, generating one if they don't have one.
 */
export interface GetOrCreateFuulReferralCodeParams {
  address: string;
}

export interface GetOrCreateFuulReferralCodeResponse {
  /**
   * True if a new referral code was generated, false if one already existed.
   */
  created: boolean;
}
