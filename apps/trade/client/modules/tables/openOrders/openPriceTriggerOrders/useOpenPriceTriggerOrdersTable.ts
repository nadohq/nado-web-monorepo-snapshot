import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useFilteredProductIds } from 'client/hooks/markets/useFilteredProductIds';
import { useQuerySubaccountOpenTriggerOrders } from 'client/hooks/query/subaccount/useQuerySubaccountOpenTriggerOrders';
import { OpenPriceTriggerOrderTableItem } from 'client/modules/tables/types/OpenPriceTriggerOrderTableItem';
import { getOrderTableItem } from 'client/modules/tables/utils/getOrderTableItem';
import { getProductTableItem } from 'client/modules/tables/utils/getProductTableItem';
import { PriceTriggerOrderDisplayType } from 'client/modules/trading/types/orderDisplayTypes';
import {
  getPriceTriggerCriteria,
  requirePriceTriggerCriteria,
} from 'client/modules/trading/utils/trigger/getPriceTriggerCriteria';
import { getTriggerOrderDisplayType } from 'client/modules/trading/utils/trigger/getTriggerOrderDisplayType';
import { QueryState } from 'client/types/QueryState';
import { secondsToMilliseconds } from 'date-fns';
import { includes } from 'lodash';
import { useMemo } from 'react';

export function useOpenPriceTriggerOrdersTable({
  productIds,
  triggerOrderDisplayTypes,
}: {
  productIds?: number[];
  triggerOrderDisplayTypes?: PriceTriggerOrderDisplayType[];
}): QueryState<OpenPriceTriggerOrderTableItem[]> {
  const { filteredProductIds, isLoading: marketsAreLoading } =
    useFilteredProductIds({ productIds });
  const { data: allMarketsStaticData } = useAllMarketsStaticData();

  const {
    isLoading: ordersAreLoading,
    isError: ordersIsError,
    data: ordersData,
  } = useQuerySubaccountOpenTriggerOrders();

  const openTriggerOrders = useMemo(() => {
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
        .filter((openTriggerOrder) => {
          // Only allow price trigger orders
          const priceTriggerCriteria = getPriceTriggerCriteria(
            openTriggerOrder.order.triggerCriteria,
          );
          if (!priceTriggerCriteria) {
            return false;
          }
          // If orderTypes is not provided, show all price-based trigger orders
          if (!triggerOrderDisplayTypes) {
            return true;
          }

          const orderDisplayType = getTriggerOrderDisplayType(openTriggerOrder);
          return includes(triggerOrderDisplayTypes, orderDisplayType);
        })
        .map((openTriggerOrder): OpenPriceTriggerOrderTableItem => {
          const orderTableItem = getOrderTableItem({
            triggerOrderInfo: openTriggerOrder,
          });

          const priceTriggerCriteria = requirePriceTriggerCriteria(
            openTriggerOrder.order.triggerCriteria,
          );

          const { productId, digest } = openTriggerOrder.order;
          const orderDisplayType = getTriggerOrderDisplayType(openTriggerOrder);

          return {
            ...productTableItem,
            ...orderTableItem,
            timePlacedMillis: secondsToMilliseconds(
              openTriggerOrder.placementTime,
            ),
            priceTriggerCriteria,
            orderForCancellation: {
              productId,
              digest,
              decimalAdjustedTotalAmount: orderTableItem.totalBaseAmount,
              isTrigger: true,
              orderDisplayType,
            },
          };
        });
    });
  }, [
    allMarketsStaticData,
    filteredProductIds,
    triggerOrderDisplayTypes,
    ordersData,
  ]);

  return {
    data: openTriggerOrders,
    isLoading: ordersAreLoading || marketsAreLoading,
    isError: ordersIsError,
  };
}
