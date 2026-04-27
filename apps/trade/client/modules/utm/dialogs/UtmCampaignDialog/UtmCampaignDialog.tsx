import { NextImageSrc } from '@nadohq/web-common';
import { PrimaryButton } from '@nadohq/web-ui';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import Image from 'next/image';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Campaign IDs for UTM tracking (i.e. spdl/utm_campaign parameter in URL).
 * Use an union type to define all possible campaign IDs.
 */
export const ENABLED_CAMPAIGN_IDS = ['example_campaign'] as const;

export type UtmCampaignID = (typeof ENABLED_CAMPAIGN_IDS)[number];

export interface UtmCampaignDialogParams {
  campaignId: UtmCampaignID;
}

interface UtmCampaignContent {
  title: string;
  imageSrc?: NextImageSrc;
  bodyContent: ReactNode;
}

export function UtmCampaignDialog({ campaignId }: UtmCampaignDialogParams) {
  const { t } = useTranslation();
  const { hide, push } = useDialog();

  const dialogContent: UtmCampaignContent = {
    example_campaign: {
      title: 'Example Campaign',
      bodyContent: null,
    },
  }[campaignId];

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {dialogContent.title}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        {dialogContent.imageSrc && (
          <Image
            quality={100}
            src={dialogContent.imageSrc}
            className="h-auto w-full rounded-lg"
            alt=""
          />
        )}
        {dialogContent.bodyContent}
        <PrimaryButton onClick={() => push({ type: 'connect', params: {} })}>
          {t(($) => $.buttons.connectWallet)}
        </PrimaryButton>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
