import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { StaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { useMarketNameFromSearchParams } from 'client/hooks/ui/navigation/useMarketNameFromSearchParams';
import { ROUTES } from 'client/modules/app/consts/routes';
import { startsWith } from 'lodash';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

/**
 * Returns the current market based on the URL path and search parameters.
 * It checks if the user is on a perpetual or spot trading page and matches the market name from the URL.
 * If no market is found (eg. not on a trading page), it returns undefined.
 */
export function useMarketForCurrentRoute(): StaticMarketData | undefined {
  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const pathname = usePathname();
  const marketName = useMarketNameFromSearchParams();

  return useMemo(() => {
    if (!marketName) {
      return;
    }

    const isOnPerp = startsWith(pathname, ROUTES.perpTrading);
    const isOnSpot = startsWith(pathname, ROUTES.spotTrading);

    if (isOnPerp) {
      return Object.values(allMarketsStaticData?.perpMarkets ?? {}).find(
        (mkt) => mkt.metadata.marketName.toLowerCase() === marketName,
      );
    }

    if (isOnSpot) {
      return Object.values(allMarketsStaticData?.spotMarkets ?? {}).find(
        (mkt) => mkt.metadata.marketName.toLowerCase() === marketName,
      );
    }
  }, [allMarketsStaticData, marketName, pathname]);
}
