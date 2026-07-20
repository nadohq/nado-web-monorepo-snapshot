import { BigNumbers, QUOTE_PRODUCT_ID } from '@nadohq/client';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { useQueryLatestOraclePrices } from 'client/hooks/query/markets/useQueryLatestOraclePrices';
import { useOpenEngineOrdersTable } from 'client/modules/tables/openOrders/openEngineOrders/useOpenEngineOrdersTable';
import { useOpenPriceTriggerOrdersTable } from 'client/modules/tables/openOrders/openPriceTriggerOrders/useOpenPriceTriggerOrdersTable';
import { useOpenTimeTriggerOrdersTable } from 'client/modules/tables/openOrders/openTimeTriggerOrders/useOpenTimeTriggerOrdersTable';
import { ORDER_DISPLAY_TYPES_BY_CATEGORY } from 'client/modules/trading/consts/orderDisplayTypesByCategory';
import { useMemo } from 'react';

export type OpenOrdersTotalsSubTabId = 'engine_orders' | 'stop_orders' | 'twap';

interface Params {
  activeSubTabId: OpenOrdersTotalsSubTabId;
  productIds: number[] | undefined;
}

/**
 * Computes the order value total and net delta (in USD) for the given open
 * orders sub-tab.
 */
export function useOpenOrdersTotals({ activeSubTabId, productIds }: Params) {
  const { data: allMarketsData } = useAllMarkets();
  const { data: latestOraclePrices } = useQueryLatestOraclePrices();
  const { data: engineOrders } = useOpenEngineOrdersTable(productIds);
  const { data: stopOrders } = useOpenPriceTriggerOrdersTable({
    productIds,
    triggerOrderDisplayTypes: ORDER_DISPLAY_TYPES_BY_CATEGORY.stop,
  });
  const { data: twapOrders } = useOpenTimeTriggerOrdersTable({ productIds });

  return useMemo(() => {
    const subTabOrders = {
      engine_orders: engineOrders,
      stop_orders: stopOrders,
      twap: twapOrders,
    }[activeSubTabId];

    if (!subTabOrders || !allMarketsData) {
      return undefined;
    }

    let totalOrderValueUsd = BigNumbers.ZERO;
    let netDeltaUsd = BigNumbers.ZERO;

    subTabOrders.forEach((order) => {
      // Order value is in the market's quote token — convert to USD via the
      // quote token's oracle price.
      const quoteProductId =
        allMarketsData.allMarkets[order.productId]?.metadata.quoteProductId ??
        QUOTE_PRODUCT_ID;
      const quoteOraclePrice =
        latestOraclePrices?.[quoteProductId]?.oraclePrice ?? BigNumbers.ONE;

      const orderValueUsd = order.totalQuoteSize.multipliedBy(quoteOraclePrice);
      totalOrderValueUsd = totalOrderValueUsd.plus(orderValueUsd);
      netDeltaUsd = netDeltaUsd.plus(
        order.orderSide === 'long' ? orderValueUsd : orderValueUsd.negated(),
      );
    });

    return { totalOrderValueUsd, netDeltaUsd };
  }, [
    activeSubTabId,
    engineOrders,
    stopOrders,
    twapOrders,
    allMarketsData,
    latestOraclePrices,
  ]);
}
