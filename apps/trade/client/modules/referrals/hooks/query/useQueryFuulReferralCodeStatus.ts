import { Fuul } from '@fuul/sdk';
import { createQueryKey, QueryDisabledError } from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';

export function fuulReferralCodeStatusQueryKey(code?: string) {
  return createQueryKey('fuulReferralCodeStatus', code);
}

/**
 * Queries whether a referral code is free
 */
export function useQueryFuulReferralCodeStatus(code?: string) {
  const disabled = code === undefined;

  return useQuery({
    queryKey: fuulReferralCodeStatusQueryKey(code),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      return Fuul.getReferralCode({
        code,
      });
    },
    enabled: !disabled,
  });
}
