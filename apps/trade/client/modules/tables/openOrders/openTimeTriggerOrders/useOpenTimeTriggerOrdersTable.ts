import { removeDecimals, toBigNumber } from '@nadohq/client';
import { calcOrderFillPrice } from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useFilteredProductIds } from 'client/hooks/markets/useFilteredProductIds';
import { useQuerySubaccountOpenTriggerOrders } from 'client/hooks/query/subaccount/useQuerySubaccountOpenTriggerOrders';
import { OpenTimeTriggerOrderTableItem } from 'client/modules/tables/types/OpenTimeTriggerOrderTableItem';
import { getOrderTableItem } from 'client/modules/tables/utils/getOrderTableItem';
import { getProductTableItem } from 'client/modules/tables/utils/getProductTableItem';
import { calculateTwapRuntimeInMillis } from 'client/modules/trading/components/twap/utils';
import { requireTimeTriggerCriteria } from 'client/modules/trading/utils/trigger/getTimeTriggerCriteria';
import { getTriggerOrderDisplayType } from 'client/modules/trading/utils/trigger/getTriggerOrderDisplayType';
import { getTriggerOrderStatusInfo } from 'client/modules/trading/utils/trigger/getTriggerOrderStatusInfo';
import { QueryState } from 'client/types/QueryState';
import { secondsToMilliseconds } from 'date-fns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to fetch and format time-based trigger orders (TWAP orders) for display in a table
 * @param productIds - Optional array of product IDs to filter orders
 * @param triggerOrderDisplayTypes - Optional array of trigger order display types to filter
 * @returns Query state with formatted time trigger order data
 */
export function useOpenTimeTriggerOrdersTable({
  productIds,
}: {
  productIds?: number[];
}): QueryState<OpenTimeTriggerOrderTableItem[]> {
  const { t } = useTranslation();

  const { filteredProductIds, isLoading: marketsAreLoading } =
    useFilteredProductIds({ productIds });
  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const {
    isLoading: ordersAreLoading,
    isError: ordersIsError,
    data: ordersData,
  } = useQuerySubaccountOpenTriggerOrders();

  const timeTriggerOrders = useMemo(() => {
    if (!ordersData || !allMarketsStaticData) {
      return;
    }

    return filteredProductIds.flatMap((productId) => {
      const ordersForProduct = ordersData?.[productId];
      const productTableItem = getProductTableItem({
        productId,
        allMarketsStaticData,
      });

      if (!ordersForProduct?.length || !productTableItem) {
        return [];
      }

      return ordersForProduct
        .map((openTriggerOrder): OpenTimeTriggerOrderTableItem | undefined => {
          const { productId, digest, appendix } = openTriggerOrder.order;

          if (!appendix.twap) {
            return;
          }

          const orderTableItem = getOrderTableItem({
            triggerOrderInfo: openTriggerOrder,
          });

          // Only allow time trigger orders
          const timeTriggerCriteria = requireTimeTriggerCriteria(
            openTriggerOrder.order.triggerCriteria,
          );

          const triggeredEngineOrder = openTriggerOrder.triggeredEngineOrder;
          const totalAmount = openTriggerOrder.order.amount;
          const decimalAdjustedTotalAmount = removeDecimals(totalAmount);

          const filledAvgPrice = triggeredEngineOrder
            ? calcOrderFillPrice(
                triggeredEngineOrder.quoteFilled,
                triggeredEngineOrder.totalFee,
                triggeredEngineOrder.baseFilled,
              )
            : undefined;

          const filledBaseSize = triggeredEngineOrder
            ? removeDecimals(triggeredEngineOrder.baseFilled).abs()
            : undefined;

          const frequencyInSeconds = toBigNumber(
            timeTriggerCriteria.interval,
          ).toNumber();

          const totalRuntimeInMillis = calculateTwapRuntimeInMillis(
            frequencyInSeconds,
            appendix.twap.numOrders,
          );

          return {
            ...productTableItem,
            ...orderTableItem,
            timePlacedMillis: secondsToMilliseconds(
              openTriggerOrder.placementTime,
            ),
            filledAvgPrice,
            filledBaseSize,
            totalBaseSize: decimalAdjustedTotalAmount.abs(),
            status: getTriggerOrderStatusInfo(t, openTriggerOrder),
            frequencyInMillis: secondsToMilliseconds(frequencyInSeconds),
            totalRuntimeInMillis,
            orderForCancellation: {
              productId,
              digest,
              decimalAdjustedTotalAmount,
              isTrigger: true,
              orderDisplayType: getTriggerOrderDisplayType(openTriggerOrder),
            },
          };
        })
        .filter(nonNullFilter);
    });
  }, [allMarketsStaticData, filteredProductIds, ordersData, t]);

  return {
    data: timeTriggerOrders,
    isLoading: ordersAreLoading || marketsAreLoading,
    isError: ordersIsError,
  };
}
