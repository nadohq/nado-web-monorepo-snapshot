import { LabelTooltip, TextButton } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { useLatestMarketPrice } from 'client/hooks/markets/useLatestMarketPrice';
import { roundToIncrement } from 'client/utils/rounding';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  productId: number | undefined;
  priceIncrement: BigNumber | undefined;
  setPriceInput: (price: string) => void;
}

export function MidPriceButton({
  productId,
  priceIncrement,
  setPriceInput,
}: Props) {
  const { t } = useTranslation();
  const { data } = useLatestMarketPrice({ productId });
  const safeMidPrice = data?.safeMidPrice;

  const onClick = useCallback(() => {
    if (!safeMidPrice) {
      return;
    }

    const midPriceRounded = roundToIncrement(safeMidPrice, priceIncrement);
    if (midPriceRounded) {
      setPriceInput(midPriceRounded.toString());
    }
  }, [safeMidPrice, priceIncrement, setPriceInput]);

  return (
    <TextButton onClick={onClick} colorVariant="accent">
      <LabelTooltip label={t(($) => $.tooltips.fillInMidPrice)} noHelpCursor>
        {t(($) => $.midPriceAbbrev)}
      </LabelTooltip>
    </TextButton>
  );
}
