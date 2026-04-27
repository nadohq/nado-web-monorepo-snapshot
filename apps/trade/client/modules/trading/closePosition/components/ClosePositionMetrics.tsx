import { getMarketPriceFormatSpecifier } from '@nadohq/react-client';
import { Pill } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useLatestOrderFill } from 'client/hooks/markets/useLatestOrderFill';
import { PerpPositionItem } from 'client/hooks/subaccount/usePerpPositions';
import { useTranslation } from 'react-i18next';

interface Props {
  perpPositionItem: PerpPositionItem | undefined;
  priceIncrement: BigNumber | undefined;
}

export function ClosePositionMetrics({
  perpPositionItem,
  priceIncrement,
}: Props) {
  const { t } = useTranslation();

  const { data: latestOrderFillPrice } = useLatestOrderFill({
    productId: perpPositionItem?.productId,
  });

  const sidePillContent = (
    <Pill
      sizeVariant="xs"
      colorVariant={
        perpPositionItem?.amount.isPositive() ? 'positive' : 'negative'
      }
    >
      {perpPositionItem?.amount.isPositive()
        ? t(($) => $.long)
        : t(($) => $.short)}
    </Pill>
  );

  return (
    <div className="flex flex-col gap-y-3">
      <ValueWithLabel.Horizontal
        sizeVariant="xs"
        label={t(($) => $.contract)}
        valueContent={perpPositionItem?.metadata.marketName}
        valueEndElement={sidePillContent}
      />
      <ValueWithLabel.Horizontal
        sizeVariant="xs"
        label={t(($) => $.entryPrice)}
        value={perpPositionItem?.price.averageEntryPrice}
        numberFormatSpecifier={getMarketPriceFormatSpecifier(priceIncrement)}
      />
      <ValueWithLabel.Horizontal
        sizeVariant="xs"
        label={t(($) => $.lastPrice)}
        value={latestOrderFillPrice?.price}
        numberFormatSpecifier={getMarketPriceFormatSpecifier(priceIncrement)}
      />
    </div>
  );
}
