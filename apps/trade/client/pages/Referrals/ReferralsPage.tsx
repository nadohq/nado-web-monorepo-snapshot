'use client';

import { SectionedCard } from '@nadohq/web-ui';
import { AppPage } from 'client/modules/app/AppPage';
import { AutoGetOrCreateAddressFuulReferralCode } from 'client/pages/Referrals/components/AutoGetOrCreateAddressFuulReferralCode';
import { EnterReferralCodeButton } from 'client/pages/Referrals/components/EnterReferralCodeButton';
import { ReferredTradersTable } from 'client/pages/Referrals/components/ReferredTradersTable/ReferredTradersTable';
import { UserReferralCode } from 'client/pages/Referrals/components/UserReferralCode';
import { UserReferralStatsBar } from 'client/pages/Referrals/components/UserReferralStatsBar';
import { useTranslation } from 'react-i18next';

export function ReferralsPage() {
  const { t } = useTranslation();

  return (
    <AppPage.Content className="max-w-200">
      <AppPage.Header title={t(($) => $.pageTitles.referrals)} />
      <UserReferralCode />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <UserReferralStatsBar />
        <EnterReferralCodeButton />
      </div>
      <SectionedCard>
        <SectionedCard.Header>
          {t(($) => $.referrals.referredTraders)}
        </SectionedCard.Header>
        <SectionedCard.Content className="p-0">
          <ReferredTradersTable />
        </SectionedCard.Content>
      </SectionedCard>
      <AutoGetOrCreateAddressFuulReferralCode />
    </AppPage.Content>
  );
}
