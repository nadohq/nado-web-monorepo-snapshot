import { MarketCategory } from '@nadohq/react-client';
import { ROUTES } from 'client/modules/app/consts/routes';
import { useEnabledFeatures } from 'client/modules/envSpecificContent/hooks/useEnabledFeatures';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface NavMarketCategory {
  title: ReactNode;
  description: string;
  // Destination link when clicking on the mobile nav item
  href: string;
  marketCategory: MarketCategory;
}

export function useNavTradeMarketCategories() {
  const { t } = useTranslation();
  const { isSpotTradingEnabled } = useEnabledFeatures();

  return useMemo(() => {
    const perps: NavMarketCategory = {
      title: t(($) => $.perps),
      description: t(($) => $.tradePerpContracts),
      href: ROUTES.perpTrading,
      marketCategory: 'perp',
    };

    const spot: NavMarketCategory = {
      title: t(($) => $.spot),
      description: t(($) => $.buyAndSellTokens),
      href: ROUTES.spotTrading,
      marketCategory: 'spot',
    };
    return isSpotTradingEnabled ? [perps, spot] : [perps];
  }, [isSpotTradingEnabled, t]);
}
