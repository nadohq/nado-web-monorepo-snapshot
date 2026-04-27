import { AdminToolsPage } from 'client/pages/AdminTools/AdminToolsPage';
import { Metadata } from 'next';
import { getT } from 'server/i18n/i18n';

export default function AdminTools() {
  return <AdminToolsPage />;
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t(($) => $.pageTitles.adminTools) };
}
