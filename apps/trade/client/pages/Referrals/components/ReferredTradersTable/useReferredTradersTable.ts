import { BigNumbers } from '@nadohq/client';
import { formatTimestamp, TimeFormatSpecifier } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { useQueryAddressFuulReferralCode } from 'client/modules/referrals/hooks/query/useQueryAddressFuulReferralCode';
import { useQueryAddressFuulReferralEarningsPerUser } from 'client/modules/referrals/hooks/query/useQueryAddressFuulReferralEarningsPerUser';
import { parseISO } from 'date-fns';
import { get } from 'lodash';
import { useMemo } from 'react';

export interface ReferredTradersTableItem extends WithDataTableRowId {
  number: number;
  address: string;
  usedAtDate: string;
  referredVolumeUsdt: BigNumber;
}

export function useReferredTradersTable() {
  const { data: referralCode, isLoading: isLoadingReferralCode } =
    useQueryAddressFuulReferralCode();
  const { data: earningsData, isLoading: isLoadingEarnings } =
    useQueryAddressFuulReferralEarningsPerUser();

  const data: ReferredTradersTableItem[] | undefined = useMemo(() => {
    if (!referralCode || !earningsData) {
      return undefined;
    }

    return referralCode?.used_by?.map((referredUser, index) => {
      const earningsFromUser = get(
        earningsData,
        referredUser.identifier.toLowerCase(),
        undefined,
      );

      return {
        number: index + 1,
        address: referredUser.identifier,
        usedAtDate: formatTimestamp(parseISO(referredUser.used_at), {
          formatSpecifier: TimeFormatSpecifier.MONTH_D_YYYY,
        }),
        referredVolumeUsdt:
          earningsFromUser?.referredVolumeUsdt ?? BigNumbers.ZERO,
        rowId: referredUser.identifier,
      };
    });
  }, [earningsData, referralCode]);

  return {
    data,
    isLoading: isLoadingEarnings || isLoadingReferralCode,
  };
}
