import { ReferralsPage } from 'client/pages/Referrals/ReferralsPage';
import { Metadata } from 'next';
import { getT } from 'server/i18n/i18n';

export default function Referrals() {
  return <ReferralsPage />;
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t(($) => $.pageTitles.referrals),
  };
}
