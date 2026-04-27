import { HistoricalAggregatedTradesTable } from 'client/modules/tables/historicalTrades/historicalAggregatedTrades/HistoricalAggregatedTradesTable';
import { MobileHistoricalAggregatedTradesTab } from 'client/modules/tables/historicalTrades/historicalAggregatedTrades/MobileHistoricalAggregatedTradesTab';
import { HistoricalIndividualTradesTable } from 'client/modules/tables/historicalTrades/historicalIndividualTrades/HistoricalIndividualTradesTable';
import { MobileHistoricalIndividualTradesTab } from 'client/modules/tables/historicalTrades/historicalIndividualTrades/MobileHistoricalIndividualTradesTab';
import { TableTabWithSubTabs } from 'client/modules/tables/tabs/TableTabWithSubTabs';
import { HistoricalTableTabProps } from 'client/modules/tables/tabs/types';
import { TradingSubTab } from 'client/modules/trading/layout/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Trade History tab content with subtabs for individual and aggregated trades.
 */
export function HistoricalTradesTableTabContent<TTabID extends string>({
  pageSize,
  showPagination,
  productIds,
  isMobile,
}: HistoricalTableTabProps) {
  const { t } = useTranslation();

  const tradeHistorySubTabs = useMemo(() => {
    const individualTradesContent = isMobile ? (
      <MobileHistoricalIndividualTradesTab
        pageSize={pageSize}
        productIds={productIds}
      />
    ) : (
      <HistoricalIndividualTradesTable
        pageSize={pageSize}
        productIds={productIds}
        showPagination={showPagination}
      />
    );

    const aggregatedTradesContent = isMobile ? (
      <MobileHistoricalAggregatedTradesTab
        pageSize={pageSize}
        productIds={productIds}
      />
    ) : (
      <HistoricalAggregatedTradesTable
        pageSize={pageSize}
        productIds={productIds}
        showPagination={showPagination}
      />
    );

    return [
      {
        id: 'aggregated_trades',
        label: t(($) => $.aggregated),
        content: aggregatedTradesContent,
      },
      {
        id: 'individual_trades',
        label: t(($) => $.individual),
        content: individualTradesContent,
      },
    ] as TradingSubTab<TTabID>[];
  }, [isMobile, pageSize, productIds, showPagination, t]);

  return <TableTabWithSubTabs subTabs={tradeHistorySubTabs} />;
}
