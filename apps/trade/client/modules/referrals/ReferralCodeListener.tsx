import { FUUL_REFERRAL_PARAM } from 'client/modules/referrals/consts';
import { useFuulReferralsContext } from 'client/modules/referrals/FuulReferralsContext';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Populates the referral code context with the referral code from the URL query
 */
export function ReferralCodeListener() {
  const { setReferralCodeForSession } = useFuulReferralsContext();

  const searchParams = useSearchParams();
  const fuulReferralCode = searchParams.get(FUUL_REFERRAL_PARAM);

  useEffect(() => {
    // If a Fuul referral code is present in the URL, set it in the context
    if (fuulReferralCode) {
      setReferralCodeForSession(fuulReferralCode.trim());
    }
  }, [fuulReferralCode, setReferralCodeForSession]);

  return null;
}
