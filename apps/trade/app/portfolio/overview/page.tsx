import { PortfolioOverviewSubpage } from 'client/pages/Portfolio/subpages/Overview/PortfolioOverviewSubpage';
import { Metadata } from 'next';
import { getT } from 'server/i18n/i18n';

export default function OverviewSubpage() {
  return <PortfolioOverviewSubpage />;
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t(($) => $.pageTitles.overview),
  };
}
