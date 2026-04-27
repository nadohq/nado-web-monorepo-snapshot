import { NLP_TOKEN_INFO } from '@nadohq/react-client';
import { TabIdentifiable } from 'client/hooks/ui/tabs/types';
import { useAtomControlledTabs } from 'client/hooks/ui/tabs/useAtomControlledTabs';
import { HistoricalFundingTableTabContent } from 'client/modules/tables/historicalFunding/HistoricalFundingTableTabContent';
import { HistoricalOrdersTableTabContent } from 'client/modules/tables/historicalOrders/HistoricalOrdersTableTabContent';
import { HistoricalTradesTableTabContent } from 'client/modules/tables/historicalTrades/HistoricalTradesTableTabContent';
import { PaginatedInterestPaymentsTable } from 'client/modules/tables/interestPayments/PaginatedInterestPaymentsTable';
import { LiquidationEventsTable } from 'client/modules/tables/liquidations/LiquidationEventsTable/LiquidationEventsTable';
import { DepositEventsTable } from 'client/pages/Portfolio/subpages/History/components/DepositEventsTable';
import { NlpEventsTable } from 'client/pages/Portfolio/subpages/History/components/NlpEventsTable';
import { SettlementEventsTable } from 'client/pages/Portfolio/subpages/History/components/SettlementEventsTable';
import { TransferEventsTable } from 'client/pages/Portfolio/subpages/History/components/TransferEventsTable';
import { WithdrawalEventsTable } from 'client/pages/Portfolio/subpages/History/components/WithdrawalEventsTable';
import { HistoryExportType } from 'client/pages/Portfolio/subpages/History/exportHistory/types';
import { PortfolioHistoryTabID } from 'client/pages/Portfolio/subpages/History/types';
import { portfolioHistoryTabIdAtom } from 'client/store/portfolioStore';
import { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 10;

export interface PortfolioHistoryTab extends TabIdentifiable<PortfolioHistoryTabID> {
  label: string;
  content: ReactNode;
}

interface UsePortfolioHistoryTabs {
  selectedTab: PortfolioHistoryTab;
  selectedTabId: PortfolioHistoryTabID;
  setSelectedUntypedTabId: (id: string) => void;
  setSelectedTabId: (id: PortfolioHistoryTabID) => void;
  selectedExportType: HistoryExportType;
  tabs: PortfolioHistoryTab[];
}

type HistoricalOrdersSubTabID =
  | 'historical_engine_orders'
  | 'historical_stop_orders'
  | 'historical_tp_sl'
  | 'historical_twap';

export function usePortfolioHistoryTabs(): UsePortfolioHistoryTabs {
  const { t } = useTranslation();

  const [historicalOrdersSubTabId, setHistoricalOrdersSubTabId] =
    useState<HistoricalOrdersSubTabID>('historical_engine_orders');

  const tabs: PortfolioHistoryTab[] = useMemo(() => {
    return [
      {
        id: 'trades',
        label: t(($) => $.trades),
        content: (
          <HistoricalTradesTableTabContent
            showPagination
            pageSize={PAGE_SIZE}
          />
        ),
      },
      {
        id: 'order_history',
        label: t(($) => $.orders),
        content: (
          <HistoricalOrdersTableTabContent
            showPagination
            pageSize={PAGE_SIZE}
            onSelectedSubTabIdChange={(id) =>
              setHistoricalOrdersSubTabId(id as HistoricalOrdersSubTabID)
            }
          />
        ),
      },
      {
        id: 'funding_payments',
        label: t(($) => $.fundingPayments),
        content: (
          <HistoricalFundingTableTabContent
            showPagination
            pageSize={PAGE_SIZE}
          />
        ),
      },
      {
        id: 'interest_payments',
        label: t(($) => $.interestPayments),
        content: (
          <PaginatedInterestPaymentsTable showPagination pageSize={PAGE_SIZE} />
        ),
      },
      {
        id: 'deposits',
        label: t(($) => $.deposits),
        content: <DepositEventsTable showPagination pageSize={PAGE_SIZE} />,
      },
      {
        id: 'withdrawals',
        label: t(($) => $.withdrawals),
        content: <WithdrawalEventsTable showPagination pageSize={PAGE_SIZE} />,
      },
      {
        id: 'transfers',
        label: t(($) => $.transfers),
        content: <TransferEventsTable showPagination pageSize={PAGE_SIZE} />,
      },
      {
        id: 'nlp',
        label: NLP_TOKEN_INFO.symbol,
        content: <NlpEventsTable showPagination pageSize={PAGE_SIZE} />,
      },
      {
        id: 'settlements',
        label: t(($) => $.settlements),
        content: <SettlementEventsTable showPagination pageSize={PAGE_SIZE} />,
      },
      {
        id: 'liquidations',
        label: t(($) => $.liquidations),
        content: <LiquidationEventsTable showPagination pageSize={PAGE_SIZE} />,
      },
    ];
  }, [t]);

  const {
    selectedTab,
    selectedTabId,
    setSelectedTabId,
    setSelectedUntypedTabId,
  } = useAtomControlledTabs(tabs, portfolioHistoryTabIdAtom);

  const selectedExportType = (() => {
    switch (selectedTabId) {
      case 'order_history':
        return historicalOrdersSubTabId;
      default:
        return selectedTabId;
    }
  })();

  return {
    tabs,
    selectedTab,
    selectedTabId,
    setSelectedTabId,
    setSelectedUntypedTabId,
    selectedExportType,
  };
}
