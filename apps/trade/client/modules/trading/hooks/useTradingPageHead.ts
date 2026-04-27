import {
  formatNumber,
  getMarketPriceFormatSpecifier,
} from '@nadohq/react-client';
import { useDebounce } from 'ahooks';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useLatestOrderFill } from 'client/hooks/markets/useLatestOrderFill';
import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  productId: number | undefined;
}

/**
 * Hook used to apply a title to the trading page based on the latest price
 */
export function useTradingPageHead({ productId }: Props) {
  const { t } = useTranslation();

  const { data: latestPrice } = useLatestOrderFill({
    productId: productId,
  });
  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const debouncedFill = useDebounce(latestPrice, { wait: 1000 });

  const marketData = productId
    ? allMarketsStaticData?.allMarkets[productId]
    : undefined;

  // Since the data is client-side, we directly update the `document` title
  useLayoutEffect(() => {
    if (!document || !marketData || !debouncedFill) {
      return;
    }

    const marketName = marketData.metadata.marketName;
    const priceFormatSpecifier = getMarketPriceFormatSpecifier(
      marketData.priceIncrement,
    );

    // Formatting to be consistent with the title template applied in the root layout
    // ex "60,577 BTCUSDT | Nado"
    document.title = t(($) => $.tradingPageTitle, {
      price: formatNumber(debouncedFill?.price, {
        formatSpecifier: priceFormatSpecifier,
      }),
      marketName,
    });
  }, [debouncedFill, marketData, t]);
}
