import { MobileOpenEngineOrdersTab } from 'client/modules/tables/openOrders/openEngineOrders/MobileOpenEngineOrdersTab';
import { OpenEngineOrdersTable } from 'client/modules/tables/openOrders/openEngineOrders/OpenEngineOrdersTable';
import { MobileOpenPriceTriggerOrdersTab } from 'client/modules/tables/openOrders/openPriceTriggerOrders/MobileOpenPriceTriggerOrdersTab';
import { OpenPriceTriggerOrdersTable } from 'client/modules/tables/openOrders/openPriceTriggerOrders/OpenPriceTriggerOrdersTable';
import { MobileOpenTimeTriggerOrdersTab } from 'client/modules/tables/openOrders/openTimeTriggerOrders/MobileOpenTimeTriggerOrdersTab';
import { OpenTimeTriggerOrdersTable } from 'client/modules/tables/openOrders/openTimeTriggerOrders/OpenTimeTriggerOrdersTable';
import { TableTabWithSubTabs } from 'client/modules/tables/tabs/TableTabWithSubTabs';
import { TableTabProps } from 'client/modules/tables/tabs/types';
import { ORDER_DISPLAY_TYPES } from 'client/modules/trading/consts/orderDisplayTypes';
import { TradingSubTab } from 'client/modules/trading/layout/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Open Orders tab content with subtabs for different order types.
 */
export function OpenOrdersTableTabContent({
  isMobile,
  productIds,
}: TableTabProps) {
  const { t } = useTranslation();

  const ordersSubTabs: TradingSubTab[] = useMemo(() => {
    const engineOrdersContent = isMobile ? (
      <MobileOpenEngineOrdersTab productIds={productIds} />
    ) : (
      <OpenEngineOrdersTable productIds={productIds} />
    );

    const stopOrdersContent = isMobile ? (
      <MobileOpenPriceTriggerOrdersTab
        productIds={productIds}
        triggerOrderDisplayTypes={ORDER_DISPLAY_TYPES.stop}
      />
    ) : (
      <OpenPriceTriggerOrdersTable
        productIds={productIds}
        triggerOrderDisplayTypes={ORDER_DISPLAY_TYPES.stop}
      />
    );

    const tpSlContent = isMobile ? (
      <MobileOpenPriceTriggerOrdersTab
        productIds={productIds}
        triggerOrderDisplayTypes={ORDER_DISPLAY_TYPES.tpSl}
      />
    ) : (
      <OpenPriceTriggerOrdersTable
        productIds={productIds}
        triggerOrderDisplayTypes={ORDER_DISPLAY_TYPES.tpSl}
      />
    );

    const twapContent = isMobile ? (
      <MobileOpenTimeTriggerOrdersTab productIds={productIds} />
    ) : (
      <OpenTimeTriggerOrdersTable productIds={productIds} />
    );

    return [
      {
        id: 'engine_orders',
        label: t(($) => $.limitOrders),
        content: engineOrdersContent,
        countIndicatorKey: 'numOpenEngineOrders',
      },
      {
        id: 'stop_orders',
        label: t(($) => $.stopOrders),
        content: stopOrdersContent,
        countIndicatorKey: 'numStopOrders',
      },
      {
        id: 'tp_sl',
        label: t(($) => $.tpslAbbrev),
        content: tpSlContent,
        countIndicatorKey: 'numTpslOrders',
      },
      {
        id: 'twap',
        label: t(($) => $.twap),
        content: twapContent,
        countIndicatorKey: 'numOpenTimeTriggerOrders',
      },
    ];
  }, [isMobile, productIds, t]);

  return <TableTabWithSubTabs subTabs={ordersSubTabs} />;
}
