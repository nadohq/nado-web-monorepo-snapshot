'use client';

import { sumBigNumberBy } from '@nadohq/client';
import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useQueryAddressFuulReferralCode } from 'client/modules/referrals/hooks/query/useQueryAddressFuulReferralCode';
import { useQueryAddressFuulReferralEarningsPerUser } from 'client/modules/referrals/hooks/query/useQueryAddressFuulReferralEarningsPerUser';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function UserReferralStatsBar() {
  const { t } = useTranslation();
  const { data: referredUsers } = useQueryAddressFuulReferralEarningsPerUser();
  const { data: referralCode } = useQueryAddressFuulReferralCode();

  const invitesLeft = referralCode?.remaining_uses;

  const totalReferredVolume = useMemo(() => {
    return sumBigNumberBy(
      Object.values(referredUsers ?? {}),
      (user) => user.referredVolumeUsdt,
    );
  }, [referredUsers]);

  return (
    <div className="flex flex-wrap gap-4 sm:gap-x-8">
      <ValueWithLabel.Vertical
        sizeVariant="xl"
        label={t(($) => $.referrals.invitesLeft)}
        value={invitesLeft}
        numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_INT}
      />
      <ValueWithLabel.Vertical
        sizeVariant="xl"
        label={t(($) => $.referrals.referredUsers)}
        value={referralCode?.uses}
        numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_INT}
      />
      <ValueWithLabel.Vertical
        sizeVariant="xl"
        label={t(($) => $.referrals.totalReferredVolume)}
        value={totalReferredVolume}
        numberFormatSpecifier={PresetNumberFormatSpecifier.CURRENCY_INT}
        tooltip={{
          id: 'fuulReferralsTotalReferredVolume',
        }}
      />
    </div>
  );
}
