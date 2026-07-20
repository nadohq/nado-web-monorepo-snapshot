'use client';

import { WithClassnames } from '@nadohq/web-common';
import { PrimaryButton } from '@nadohq/web-ui';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useQueryAddressFuulReferralStatus } from 'client/modules/referrals/hooks/query/useQueryAddressFuulReferralStatus';
import { useTranslation } from 'react-i18next';

/**
 * Button shown on the referrals page for users who haven't been referred yet,
 * allowing them to open the Enter Referral Code dialog to redeem a code.
 */
export function EnterReferralCodeButton({ className }: WithClassnames) {
  const { t } = useTranslation();
  const { show } = useDialog();
  const { data: referralStatus } = useQueryAddressFuulReferralStatus();

  if (!referralStatus || referralStatus.referred) {
    return null;
  }

  return (
    <PrimaryButton
      size="lg"
      className={className}
      onClick={() =>
        show({
          type: 'enter_referral_code',
          params: {},
        })
      }
    >
      {t(($) => $.buttons.enterReferralCode)}
    </PrimaryButton>
  );
}
