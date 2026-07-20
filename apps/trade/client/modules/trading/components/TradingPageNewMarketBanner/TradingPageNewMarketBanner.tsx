import { joinClassNames } from '@nadohq/web-common';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { getStaticMarketDataForProductId } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/getStaticMarketDataForProductId';
import { useTranslation } from 'react-i18next';

interface Props {
  productId: number | undefined;
}

export function TradingPageNewMarketBanner({ productId }: Props) {
  const { t } = useTranslation();
  const { data: staticMarketData } = useAllMarketsStaticData();

  const isNewMarket =
    productId != null &&
    !!getStaticMarketDataForProductId(productId, staticMarketData)?.isNew;

  if (!isNewMarket) {
    return null;
  }

  return (
    <div
      className={joinClassNames(
        'bg-surface-2 text-text-primary',
        'px-3 py-1.5 sm:px-6 sm:py-2',
        'text-center text-xs leading-normal sm:text-sm',
      )}
    >
      {t(($) => $.newMarketTradingNotice)}
    </div>
  );
}
