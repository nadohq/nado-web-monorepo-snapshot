'use client';

import { useCopyText, WithClassnames } from '@nadohq/web-common';
import { CopyIcon, TextButton } from '@nadohq/web-ui';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useQueryAddressFuulReferralCode } from 'client/modules/referrals/hooks/query/useQueryAddressFuulReferralCode';
import { useReferralLink } from 'client/modules/referrals/hooks/useReferralLink';
import { useTranslation } from 'react-i18next';

export function UserReferralCode({ className }: WithClassnames) {
  const { t } = useTranslation();
  const { data: fuulReferralCode } = useQueryAddressFuulReferralCode();
  const { isCopied, copy } = useCopyText();
  const { referralLink } = useReferralLink({
    referralCode: fuulReferralCode?.code,
  });

  return (
    <ValueWithLabel.Vertical
      className={className}
      sizeVariant="xl"
      label={t(($) => $.referrals.referralCode)}
      // Smaller mobile text-size to prevent overflow
      valueClassName="text-base"
      valueContent={
        <TextButton
          colorVariant="primary"
          endIcon={<CopyIcon isCopied={isCopied} />}
          onClick={() => {
            copy(referralLink);
          }}
        >
          {referralLink}
        </TextButton>
      }
    />
  );
}
