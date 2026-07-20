import { PointsPage } from 'client/pages/Points/PointsPage';
import { Metadata } from 'next';
import { getT } from 'server/i18n/i18n';

export default function Points() {
  return <PointsPage />;
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t(($) => $.pageTitles.points),
  };
}
