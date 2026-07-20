import {
  getRoundedIncrement,
  toXStocksDisplayPrice,
} from '@nadohq/react-client';
import { LabelTooltip, TextButton } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { useLatestMarketPrice } from 'client/hooks/markets/useLatestMarketPrice';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
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

  const { getExchangeRate } = useGetXStocksExchangeRate();
  const onClick = useCallback(() => {
    if (!safeMidPrice) {
      return;
    }
    const exchangeRate = getExchangeRate(productId);
    const roundedPriceIncrement = getRoundedIncrement(
      toXStocksDisplayPrice(priceIncrement, exchangeRate),
    );

    const midPrice = roundToIncrement(
      toXStocksDisplayPrice(safeMidPrice, exchangeRate),
      roundedPriceIncrement,
    );
    if (midPrice) {
      setPriceInput(midPrice.toString());
    }
  }, [safeMidPrice, getExchangeRate, productId, priceIncrement, setPriceInput]);

  return (
    <TextButton onClick={onClick} colorVariant="accent">
      <LabelTooltip label={t(($) => $.tooltips.fillInMidPrice)} noHelpCursor>
        {t(($) => $.midPriceAbbrev)}
      </LabelTooltip>
    </TextButton>
  );
}
