import { ProductEngineType, removeDecimals } from '@nadohq/client';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export interface MarketDetailsDialogParams {
  productId: number;
}

export function MarketDetailsDialog({ productId }: MarketDetailsDialogParams) {
  const { t } = useTranslation();

  const { hide } = useDialog();
  const { data: allMarkets } = useAllMarketsStaticData();

  const marketData = allMarkets?.allMarkets[productId];

  if (!marketData) {
    return null;
  }
  const sharedProductMetadata = getSharedProductMetadata(marketData.metadata);
  const quoteSymbol = allMarkets?.quotes[productId]?.symbol;

  const isPerp = marketData.type === ProductEngineType.PERP;
  const priceIncrement = marketData.priceIncrement;
  const decimalAdjustedMinSize = removeDecimals(marketData.minSize);
  const decimalAdjustedSizeIncrement = removeDecimals(marketData.sizeIncrement);

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.marketDetails)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <div className="flex items-center gap-x-2">
          <Image
            src={sharedProductMetadata.icon.asset}
            alt={sharedProductMetadata.marketName}
            className="size-7"
          />
          <span className="text-text-primary text-base">
            {sharedProductMetadata.marketName}
          </span>
        </div>
        <div className="flex flex-col gap-y-3">
          <ValueWithLabel.Horizontal
            sizeVariant="xs"
            label={t(($) => $.tickSize)}
            valueContent={priceIncrement?.toString() ?? ''}
          />
          <ValueWithLabel.Horizontal
            sizeVariant="xs"
            label={t(($) => $.minLimitOrderSize)}
            valueContent={decimalAdjustedMinSize?.toString()}
            valueEndElement={quoteSymbol}
          />
          <ValueWithLabel.Horizontal
            sizeVariant="xs"
            label={t(($) => $.orderIncrement)}
            valueContent={decimalAdjustedSizeIncrement?.toString()}
            valueEndElement={sharedProductMetadata.symbol}
          />
          <ValueWithLabel.Horizontal
            sizeVariant="xs"
            label={t(($) => $.initialWeightsLongShort)}
            valueContent={
              <>
                {marketData.longWeightInitial.toString()}
                <span className="text-text-tertiary">/</span>
                <span>{marketData.shortWeightInitial.toString()}</span>
              </>
            }
          />
          <ValueWithLabel.Horizontal
            sizeVariant="xs"
            label={t(($) => $.maintenanceWeightsLongShort)}
            valueContent={
              <>
                {marketData.longWeightMaintenance.toString()}
                <span className="text-text-tertiary">/</span>
                <span>{marketData.shortWeightMaintenance.toString()}</span>
              </>
            }
          />
          {isPerp && <PerpMarketDetailItems />}
        </div>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}

function PerpMarketDetailItems() {
  const { t } = useTranslation();

  return (
    <>
      <ValueWithLabel.Horizontal
        sizeVariant="xs"
        label={t(($) => $.funding)}
        valueContent={t(($) => $.hourly)}
      />
      <ValueWithLabel.Horizontal
        sizeVariant="xs"
        label={t(($) => $.oraclePrice)}
        valueContent={t(($) => $.chaosLabsAggregate)}
      />
      <ValueWithLabel.Horizontal
        sizeVariant="xs"
        label={t(($) => $.oracleSpotIndexPrice)}
        valueContent={t(($) => $.chaosLabsAggregate)}
      />
    </>
  );
}
