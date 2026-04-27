'use client';

import { AppPage } from 'client/modules/app/AppPage';
import { NlpHeaderMetrics } from 'client/pages/Vault/components/NlpHeaderMetrics';
import { NlpOverviewCard } from 'client/pages/Vault/components/NlpOverviewCard/NlpOverviewCard';
import { NlpPositionCard } from 'client/pages/Vault/components/NlpPositionCard/NlpPositionCard';
import { NlpTableTabs } from 'client/pages/Vault/components/NlpTableTabs/NlpTableTabs';
import { IMAGES } from 'common/brandMetadata/images';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export function VaultPage() {
  const { t } = useTranslation();

  const headerContent = (
    <div className="flex items-center gap-x-2 lg:gap-x-4">
      <Image src={IMAGES.nlpIcon} alt="" className="h-8 w-auto lg:h-11" />
      {t(($) => $.pageTitles.vault)}
    </div>
  );

  return (
    <AppPage.Content>
      <AppPage.Header title={headerContent} />
      <NlpHeaderMetrics />
      <div className="flex flex-col gap-1">
        <div className="flex flex-col gap-1 lg:grid lg:grid-cols-3">
          <NlpPositionCard />
          <NlpOverviewCard className="lg:col-span-2" />
        </div>
        <NlpTableTabs />
      </div>
    </AppPage.Content>
  );
}
