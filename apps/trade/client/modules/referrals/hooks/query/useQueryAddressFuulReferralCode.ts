import { Fuul, UserIdentifierType } from '@fuul/sdk';
import { createQueryKey, useSubaccountContext } from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { NOT_CONNECTED_ALT_QUERY_ADDRESS } from 'client/hooks/query/consts/notConnectedAltQueryAddress';
import { first } from 'lodash';

export function addressFuulReferralCodeQueryKey(address?: string) {
  return createQueryKey('addressFuulReferralCode', address);
}

/**
 * Returns referral code and related metadata for the current address
 */
export function useQueryAddressFuulReferralCode() {
  const {
    currentSubaccount: { address },
  } = useSubaccountContext();

  const addressForQuery = address ?? NOT_CONNECTED_ALT_QUERY_ADDRESS;

  return useQuery({
    queryKey: addressFuulReferralCodeQueryKey(addressForQuery),
    queryFn: async () => {
      const listCodesResponse = await Fuul.listUserReferralCodes({
        user_identifier: addressForQuery,
        user_identifier_type: UserIdentifierType.EvmAddress,
      });

      // Users should only have one referral code, so we return the first one or null if none exist
      return first(listCodesResponse.results) ?? null;
    },
  });
}
