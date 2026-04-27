'use client';

import { SectionedCard } from '@nadohq/web-ui';
import { AppPage } from 'client/modules/app/AppPage';
import { AutoUpdateAddressFuulReferralCode } from 'client/pages/Referrals/components/AutoUpdateAddressFuulReferralCode';
import { ReferralsPageDescription } from 'client/pages/Referrals/components/ReferralsPageDescription';
import { ReferredTradersTable } from 'client/pages/Referrals/components/ReferredTradersTable/ReferredTradersTable';
import { UserReferralCode } from 'client/pages/Referrals/components/UserReferralCode';
import { UserReferralStatsBar } from 'client/pages/Referrals/components/UserReferralStatsBar';
import { useTranslation } from 'react-i18next';

export function ReferralsPage() {
  const { t } = useTranslation();

  return (
    <AppPage.Content className="max-w-200">
      <AppPage.Header
        title={t(($) => $.pageTitles.referrals)}
        description={<ReferralsPageDescription />}
      />
      <UserReferralCode className="self-start" />
      <UserReferralStatsBar />
      <SectionedCard>
        <SectionedCard.Header>
          {t(($) => $.referrals.referredTraders)}
        </SectionedCard.Header>
        <SectionedCard.Content className="p-0">
          <ReferredTradersTable />
        </SectionedCard.Content>
      </SectionedCard>
      <AutoUpdateAddressFuulReferralCode />
    </AppPage.Content>
  );
}
