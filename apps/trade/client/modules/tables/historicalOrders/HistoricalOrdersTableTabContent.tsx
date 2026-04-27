import { HistoricalEngineOrdersTable } from 'client/modules/tables/historicalOrders/historicalEngineOrders/HistoricalEngineOrdersTable';
import { MobileHistoricalEngineOrdersTab } from 'client/modules/tables/historicalOrders/historicalEngineOrders/MobileHistoricalEngineOrdersTab';
import { HistoricalPriceTriggerOrdersTable } from 'client/modules/tables/historicalOrders/historicalPriceTriggerOrders/HistoricalPriceTriggerOrdersTable';
import { MobileHistoricalPriceTriggerOrdersTab } from 'client/modules/tables/historicalOrders/historicalPriceTriggerOrders/MobileHistoricalPriceTriggerOrdersTab';
import { HistoricalTimeTriggerOrdersTable } from 'client/modules/tables/historicalOrders/historicalTimeTriggerOrders/HistoricalTimeTriggerOrdersTable';
import { MobileHistoricalTimeTriggerOrdersTab } from 'client/modules/tables/historicalOrders/historicalTimeTriggerOrders/MobileHistoricalTimeTriggerOrdersTab';
import { TableTabWithSubTabs } from 'client/modules/tables/tabs/TableTabWithSubTabs';
import { HistoricalTableTabProps } from 'client/modules/tables/tabs/types';
import { TradingSubTab } from 'client/modules/trading/layout/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Order History tab content with subtabs for different historical order types.
 */
export function HistoricalOrdersTableTabContent<TTabID extends string>({
  pageSize,
  showPagination,
  productIds,
  isMobile,
  onSelectedSubTabIdChange,
}: HistoricalTableTabProps & {
  onSelectedSubTabIdChange?: (id: TTabID) => void;
}) {
  const { t } = useTranslation();

  const orderHistorySubTabs = useMemo(() => {
    const engineOrdersContent = isMobile ? (
      <MobileHistoricalEngineOrdersTab
        pageSize={pageSize}
        productIds={productIds}
      />
    ) : (
      <HistoricalEngineOrdersTable
        pageSize={pageSize}
        productIds={productIds}
        showPagination={showPagination}
      />
    );

    const stopOrdersContent = isMobile ? (
      <MobileHistoricalPriceTriggerOrdersTab
        pageSize={pageSize}
        productIds={productIds}
        reduceOnly={false}
      />
    ) : (
      <HistoricalPriceTriggerOrdersTable
        pageSize={pageSize}
        productIds={productIds}
        reduceOnly={false}
        showPagination={showPagination}
      />
    );

    const tpSlContent = isMobile ? (
      <MobileHistoricalPriceTriggerOrdersTab
        pageSize={pageSize}
        productIds={productIds}
        reduceOnly
      />
    ) : (
      <HistoricalPriceTriggerOrdersTable
        pageSize={pageSize}
        productIds={productIds}
        reduceOnly
        showPagination={showPagination}
      />
    );

    const twapContent = isMobile ? (
      <MobileHistoricalTimeTriggerOrdersTab
        pageSize={pageSize}
        productIds={productIds}
      />
    ) : (
      <HistoricalTimeTriggerOrdersTable
        pageSize={pageSize}
        productIds={productIds}
        showPagination={showPagination}
      />
    );

    return [
      {
        id: 'historical_engine_orders',
        label: t(($) => $.limitOrders),
        content: engineOrdersContent,
      },
      {
        id: 'historical_stop_orders',
        label: t(($) => $.stopOrders),
        content: stopOrdersContent,
      },
      {
        id: 'historical_tp_sl',
        label: t(($) => $.tpSl),
        content: tpSlContent,
      },
      {
        id: 'historical_twap',
        label: t(($) => $.twap),
        content: twapContent,
      },
    ] as TradingSubTab<TTabID>[];
  }, [isMobile, pageSize, productIds, showPagination, t]);

  return (
    <TableTabWithSubTabs
      subTabs={orderHistorySubTabs}
      onSelectedSubTabIdChange={onSelectedSubTabIdChange}
    />
  );
}
