import { MarketsPage } from 'client/pages/Markets/MarketsPage';
import { Metadata } from 'next';
import { getT } from 'server/i18n/i18n';

export default function Markets() {
  return <MarketsPage />;
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t(($) => $.pageTitles.markets),
  };
}
