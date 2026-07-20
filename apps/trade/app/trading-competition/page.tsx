import { TradingCompetitionPage } from 'client/pages/TradingCompetition/TradingCompetitionPage';
import { Metadata } from 'next';
import { getT } from 'server/i18n/i18n';

export default function TradingCompetition() {
  return <TradingCompetitionPage />;
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t(($) => $.pageTitles.tradingCompetition),
  };
}
