import { PortfolioFaucetSubpage } from 'client/pages/Portfolio/subpages/Faucet/PortfolioFaucetSubpage';
import { clientEnv } from 'common/environment/clientEnv';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getT } from 'server/i18n/i18n';

export default function FaucetPage() {
  return <PortfolioFaucetSubpage />;
}

export async function generateMetadata(): Promise<Metadata> {
  if (!clientEnv.base.enableExperimentalFeatures) {
    notFound();
  }

  const { t } = await getT();

  return {
    title: t(($) => $.pageTitles.faucet),
  };
}
