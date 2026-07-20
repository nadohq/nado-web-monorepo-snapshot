import { WithClassnames } from '@nadohq/web-common';
import { Icons } from '@nadohq/web-ui';
import { TabIdentifiableList } from 'client/hooks/ui/tabs/types';
import { AccountInfoCard } from 'client/modules/trading/components/AccountInfoCard/AccountInfoCard';
import { MobileTradingMarketsTabContent } from 'client/modules/trading/components/MobileTradingBottomNavigationTabs/MobileTradingMarketsTabContent';
import { MobileTradingTradeTabContent } from 'client/modules/trading/components/MobileTradingBottomNavigationTabs/MobileTradingTradeTabContent';
import { MobileTradingBottomNavigationTab } from 'client/modules/trading/layout/types';
import { ElementType, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  productId: number | undefined;
  OrderPlacement: ElementType<WithClassnames>;
  InfoCards: ElementType<WithClassnames>;
}

export function useMobileTradingBottomNavigationTabs({
  productId,
  OrderPlacement,
  InfoCards,
}: Props) {
  const { t } = useTranslation();

  return useMemo((): TabIdentifiableList<MobileTradingBottomNavigationTab> => {
    return [
      {
        id: 'market',
        label: t(($) => $.market),
        icon: Icons.ChartLine,
        content: (
          <MobileTradingMarketsTabContent
            productId={productId}
            InfoCards={InfoCards}
          />
        ),
      },
      {
        id: 'trade',
        label: t(($) => $.trade),
        icon: Icons.Coins,
        content: (
          <MobileTradingTradeTabContent
            productId={productId}
            InfoCards={InfoCards}
            OrderPlacement={OrderPlacement}
          />
        ),
      },
      {
        id: 'account',
        label: t(($) => $.account),
        icon: Icons.User,
        content: <AccountInfoCard className="flex-1" productId={productId} />,
      },
    ];
  }, [InfoCards, OrderPlacement, productId, t]);
}
