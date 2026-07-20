import { PortfolioMarginManagerSubpage } from 'client/pages/Portfolio/subpages/MarginManager/PortfolioMarginManagerSubpage';
import { Metadata } from 'next';
import { getT } from 'server/i18n/i18n';

export default function MarginManagerSubpage() {
  return <PortfolioMarginManagerSubpage />;
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t(($) => $.pageTitles.marginManager),
  };
}
