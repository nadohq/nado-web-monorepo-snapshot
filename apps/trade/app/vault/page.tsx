import { VaultPage } from 'client/pages/Vault/VaultPage';
import { Metadata } from 'next';
import { getT } from 'server/i18n/i18n';

export default function Vault() {
  return <VaultPage />;
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t(($) => $.pageTitles.vault),
  };
}
