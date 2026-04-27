import { useBaseUrl } from 'client/hooks/util/useBaseUrl';
import { FUUL_REFERRAL_PARAM } from 'client/modules/referrals/consts';
import { useMemo } from 'react';

interface Params {
  referralCode: string | undefined | null;
}

interface UseReferralLink {
  /**
   * Base URL including the query param.
   * @example app.nado.xyz?join=
   */
  baseUrlWithQueryParam: string;
  /**
   * Full referral link including the referral code.
   * @example app.nado.xyz?join=1234
   */
  referralLink: string;
}

export function useReferralLink({ referralCode }: Params) {
  const baseUrl = useBaseUrl();

  return useMemo((): UseReferralLink => {
    const baseUrlWithQueryParam = `${baseUrl}?${FUUL_REFERRAL_PARAM}=`;
    const referralLink = `${baseUrlWithQueryParam}${referralCode ?? ''}`;

    return {
      baseUrlWithQueryParam,
      referralLink,
    };
  }, [baseUrl, referralCode]);
}
