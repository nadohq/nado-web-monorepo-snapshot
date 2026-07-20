import { PerpTradingPage } from 'client/pages/PerpTrading/PerpTradingPage';
import { Metadata } from 'next';
import { getT } from 'server/i18n/i18n';

export default function Perpetuals() {
  return <PerpTradingPage />;
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t(($) => $.pageTitles.perpetuals),
  };
}
