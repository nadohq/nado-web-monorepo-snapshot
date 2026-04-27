'use client';

import { AppPage } from 'client/modules/app/AppPage';
import { LinkedSignerLocalStorage } from 'client/pages/AdminTools/sections/LinkedSignerLocalStorage';
import { ManualLinkSigner } from 'client/pages/AdminTools/sections/ManualLinkSigner';
import { useTranslation } from 'react-i18next';

export function AdminToolsPage() {
  const { t } = useTranslation();

  return (
    <AppPage.Content className="max-w-200">
      <AppPage.Header title={t(($) => $.pageTitles.adminTools)} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ManualLinkSigner />
        <LinkedSignerLocalStorage />
      </div>
    </AppPage.Content>
  );
}
