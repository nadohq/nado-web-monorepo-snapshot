import { BigNumbers } from '@nadohq/client';
import { useLatestMarketPrice } from 'client/hooks/markets/useLatestMarketPrice';
import { getIsHighSpread } from 'client/modules/trading/utils/getIsHighSpread';
import { useMemo } from 'react';

export function useIsHighSpread(productId: number | undefined) {
  const { data: latestMarketPrice } = useLatestMarketPrice({
    productId,
  });

  return useMemo(() => {
    if (
      !productId ||
      !latestMarketPrice?.safeAsk ||
      !latestMarketPrice?.safeBid
    ) {
      return false;
    }

    const spread = latestMarketPrice.safeAsk.minus(latestMarketPrice.safeBid);

    const spreadFrac = latestMarketPrice.safeMidPrice
      ? spread.div(latestMarketPrice.safeMidPrice)
      : BigNumbers.ZERO;

    return getIsHighSpread(spreadFrac);
  }, [latestMarketPrice, productId]);
}
