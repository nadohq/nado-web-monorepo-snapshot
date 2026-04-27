import { Fuul, UserIdentifierType } from '@fuul/sdk';
import {
  createQueryKey,
  QueryDisabledError,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';

export function addressFuulReferralStatusQueryKey(address?: string) {
  return createQueryKey('addressFuulReferralStatus', address);
}

/**
 * Queries whether an address has been referred for access to the app via Fuul. Also includes
 * relevant data such as the referrer and code used
 */
export function useQueryAddressFuulReferralStatus() {
  const {
    currentSubaccount: { address },
  } = useSubaccountContext();

  const disabled = !address;
  return useQuery({
    queryKey: addressFuulReferralStatusQueryKey(address),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      return Fuul.getReferralStatus({
        user_identifier: address,
        user_identifier_type: UserIdentifierType.EvmAddress,
      });
    },
    enabled: !disabled,
  });
}
