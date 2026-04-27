import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { TIER_INFO_BY_POINTS_TIER } from 'client/modules/points/tierInfoByPointsTier';
import { PointsTier } from 'client/modules/points/types';
import { SocialSharingButtons } from 'client/modules/socialSharing/components/SocialSharingButtons';
import { SocialSharingInstructionsCard } from 'client/modules/socialSharing/components/SocialSharingInstructionsCard';
import { SocialSharingPreviewImage } from 'client/modules/socialSharing/components/SocialSharingPreviewImage';
import { useSocialSharingImageGeneration } from 'client/modules/socialSharing/hooks/useSocialSharingImageGeneration';
import { StaticImageData } from 'next/image';
import { useTranslation } from 'react-i18next';

export interface PointsTierShareDialogParams {
  tier: PointsTier;
  allTimeRank: number | undefined;
  lastWeekRank: number | undefined;
}

export function PointsTierShareDialog({
  tier,
  allTimeRank,
  lastWeekRank,
}: PointsTierShareDialogParams) {
  const { t } = useTranslation();
  const { hide } = useDialog();

  const tierInfo = TIER_INFO_BY_POINTS_TIER[tier];
  const tierName = t(($) => $.tierNames[tierInfo.tierId]);
  const bannerImage = tierInfo.bannerImage as StaticImageData;
  const imageAlt = t(($) => $.imageAltText.tierNameDescription, {
    tier,
    tierName,
  });

  const {
    imageGenerationNodeRef,
    copyAndOpenX,
    copyImageToClipboard,
    isCopied,
    downloadImage,
    previewImage,
    disableSocialSharingButtons,
    onReady,
  } = useSocialSharingImageGeneration({
    xPostText: t(($) => $.pointsTierShareDialog.shareTierXPostText, {
      tierName,
      lastWeekRank: lastWeekRank ?? '',
      allTimeRank: allTimeRank ?? '',
    }),
    // Use image dimensions to preserve better image quality.
    canvasWidth: bannerImage.width,
    canvasHeight: bannerImage.height,
  });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.pointsTierShareDialog.shareYourTier)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <SocialSharingPreviewImage
          generateImgContainerRef={imageGenerationNodeRef}
          previewImage={previewImage}
          previewImageAlt={imageAlt}
        >
          {/* Using <img> instead of next/image for proper html-to-image capture */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerImage.src}
            alt={imageAlt}
            className="h-full w-full"
            onLoad={onReady}
          />
        </SocialSharingPreviewImage>
        <SocialSharingButtons
          isCopied={isCopied}
          disabled={disableSocialSharingButtons}
          onTwitterClick={copyAndOpenX}
          onDownloadClick={downloadImage}
          onCopyToClipboardClick={copyImageToClipboard}
        />
        <SocialSharingInstructionsCard />
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
