import { TradingHistoricalFundingTabContent } from 'client/modules/trading/components/TradingTableTabs/TradingHistoricalFundingTabContent';
import { TradingHistoricalOrdersTabContent } from 'client/modules/trading/components/TradingTableTabs/TradingHistoricalOrdersTabContent';
import { TradingHistoricalTradesTabContent } from 'client/modules/trading/components/TradingTableTabs/TradingHistoricalTradesTabContent';
import { TradingLiquidationsTabContent } from 'client/modules/trading/components/TradingTableTabs/TradingLiquidationsTabContent';
import { TradingOpenOrdersTabContent } from 'client/modules/trading/components/TradingTableTabs/TradingOpenOrdersTabContent';
import { TradingPerpPositionsTabContent } from 'client/modules/trading/components/TradingTableTabs/TradingPerpPositionsTabContent';
import { TradingSpotBalancesTabContent } from 'client/modules/trading/components/TradingTableTabs/TradingSpotBalancesTabContent';
import { TradingSpreadsTabContent } from 'client/modules/trading/components/TradingTableTabs/TradingSpreadsTabContent';
import { TradingTab } from 'client/modules/trading/layout/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useTradingTableTabs(): TradingTab[] {
  const { t } = useTranslation();

  return useMemo(() => {
    /* Top-level tabs */
    const balancesTab: TradingTab = {
      id: 'balances',
      label: t(($) => $.balances),
      content: <TradingSpotBalancesTabContent />,
      displayFilter: 'hideSmallBalances',
    };

    const positionsTab: TradingTab = {
      id: 'positions',
      label: t(($) => $.positions),
      countIndicatorKey: 'numPerpPositions',
      content: <TradingPerpPositionsTabContent />,
      displayFilter: 'showAllMarkets',
    };

    const tradeHistoryTab: TradingTab = {
      id: 'trade_history',
      label: t(($) => $.tradeHistory),
      content: <TradingHistoricalTradesTabContent />,
      displayFilter: 'showAllMarkets',
    };

    const fundingHistoryTab: TradingTab = {
      id: 'funding_history',
      label: t(($) => $.fundingHistory),
      content: <TradingHistoricalFundingTabContent />,
      displayFilter: 'showAllMarkets',
    };

    const orderHistoryTab: TradingTab = {
      id: 'order_history',
      label: t(($) => $.orderHistory),
      content: <TradingHistoricalOrdersTabContent />,
      displayFilter: 'showAllMarkets',
    };

    const openOrdersTab: TradingTab = {
      id: 'open_orders',
      label: t(($) => $.openOrders),
      countIndicatorKey: 'numOpenOrders',
      content: <TradingOpenOrdersTabContent />,
      displayFilter: 'showAllMarkets',
    };

    const liquidationsTab: TradingTab = {
      id: 'liquidations',
      label: t(($) => $.liquidations),
      content: <TradingLiquidationsTabContent />,
      displayFilter: 'showAllMarkets',
    };

    const spreadsTab: TradingTab = {
      id: 'spreads',
      label: t(($) => $.spreads),
      countIndicatorKey: 'numSpreads',
      content: <TradingSpreadsTabContent />,
      displayFilter: 'showAllMarkets',
    };

    return [
      positionsTab,
      balancesTab,
      openOrdersTab,
      tradeHistoryTab,
      orderHistoryTab,
      fundingHistoryTab,
      liquidationsTab,
      spreadsTab,
    ];
  }, [t]);
}
