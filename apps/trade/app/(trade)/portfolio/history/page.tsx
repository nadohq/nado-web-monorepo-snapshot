import { PortfolioHistorySubpage } from 'client/pages/Portfolio/subpages/History/PortfolioHistorySubpage';
import { Metadata } from 'next';
import { getT } from 'server/i18n/i18n';

export default function HistorySubpage() {
  return <PortfolioHistorySubpage />;
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t(($) => $.pageTitles.history),
  };
}
