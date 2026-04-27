import { SegmentedControl } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useBaseUrl } from 'client/hooks/util/useBaseUrl';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { MarginModeType } from 'client/modules/localstorage/userState/types/tradingSettings';
import { SocialSharingButtons } from 'client/modules/socialSharing/components/SocialSharingButtons';
import { SocialSharingInstructionsCard } from 'client/modules/socialSharing/components/SocialSharingInstructionsCard';
import { useSocialSharingImageGeneration } from 'client/modules/socialSharing/hooks/useSocialSharingImageGeneration';
import {
  PerpPnlDisplayType,
  PerpPnlSharingPreview,
} from 'client/modules/trading/perpPnlSocialSharing/components/PerpPnlSharingPreview';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface PerpPnlSocialSharingDialogParams {
  productId: number;
  positionAmount: BigNumber;
  pnlFrac: BigNumber;
  pnlUsd: BigNumber;
  entryPrice: BigNumber;
  referencePrice: BigNumber;
  referencePriceLabel: string;
  marginModeType: MarginModeType;
  isoLeverage: number | null;
}

export function PerpPnlSocialSharingDialog({
  productId,
  positionAmount,
  pnlFrac,
  pnlUsd,
  entryPrice,
  referencePrice,
  referencePriceLabel,
  marginModeType,
  isoLeverage,
}: PerpPnlSocialSharingDialogParams) {
  const { t } = useTranslation();

  const { hide } = useDialog();
  const [pnlDisplayType, setPnlDisplayType] =
    useState<PerpPnlDisplayType>('frac');

  const baseUrl = useBaseUrl();

  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const marketData = allMarketsStaticData?.allMarkets[productId];
  const sharedProductMetadata = marketData
    ? getSharedProductMetadata(marketData.metadata)
    : undefined;

  const xPostText = useMemo(() => {
    return t(($) => $.perpPnlSocialSharingDialog.xPostText, {
      symbol: sharedProductMetadata?.symbol,
      baseUrl,
    });
  }, [baseUrl, sharedProductMetadata?.symbol, t]);

  const {
    imageGenerationNodeRef,
    downloadImage,
    copyImageToClipboard,
    copyAndOpenX,
    previewImage,
    isCopied,
    onReady,
    disableSocialSharingButtons,
    regenerateImage,
  } = useSocialSharingImageGeneration({
    xPostText,
  });

  const onPnlDisplayTypeChange = useCallback(
    (type: PerpPnlDisplayType) => {
      setPnlDisplayType(type);
      regenerateImage();
    },
    [regenerateImage],
  );

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.sharePosition)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <SegmentedControl.Container className="grid grid-cols-2">
          <SegmentedControl.Button
            active={pnlDisplayType === 'frac'}
            onClick={() => onPnlDisplayTypeChange('frac')}
          >
            {t(($) => $.perpPnlSocialSharingDialog.pnlDisplayType.percentage)}
          </SegmentedControl.Button>
          <SegmentedControl.Button
            active={pnlDisplayType === 'usd'}
            onClick={() => onPnlDisplayTypeChange('usd')}
          >
            {t(($) => $.perpPnlSocialSharingDialog.pnlDisplayType.usd)}
          </SegmentedControl.Button>
        </SegmentedControl.Container>
        <div className="relative aspect-4/3">
          <div className="h-full w-full" ref={imageGenerationNodeRef}>
            <PerpPnlSharingPreview
              className="h-full w-full"
              baseUrl={baseUrl}
              onReady={onReady}
              amountForSide={positionAmount}
              entryPrice={entryPrice}
              referencePrice={referencePrice}
              referencePriceLabel={referencePriceLabel}
              pnlFrac={pnlFrac}
              pnlUsd={pnlUsd}
              pnlDisplayType={pnlDisplayType}
              marginModeType={marginModeType}
              isoLeverage={isoLeverage}
              productSymbol={sharedProductMetadata?.symbol}
              priceIncrement={marketData?.priceIncrement}
            />
          </div>
          {/* Render preview image so it can be copied directly from browser.
            Overlay it to prevent flicker */}
          {previewImage && (
            <Image
              fill
              src={previewImage.url}
              alt={t(($) => $.imageAltText.positionPreview)}
            />
          )}
        </div>
        <SocialSharingButtons
          isCopied={isCopied}
          onTwitterClick={copyAndOpenX}
          onDownloadClick={downloadImage}
          onCopyToClipboardClick={copyImageToClipboard}
          disabled={disableSocialSharingButtons}
        />
        <SocialSharingInstructionsCard />
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
