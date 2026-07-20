import { ErrorPage } from 'client/pages/Error/ErrorPage';
import { Metadata } from 'next';
import { getT } from 'server/i18n/i18n';

export default function NotFound() {
  return <ErrorPage statusCode={404} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t(($) => $.errors.pageNotFound),
    description: t(($) => $.errors.pageDoesNotExist),
  };
}
