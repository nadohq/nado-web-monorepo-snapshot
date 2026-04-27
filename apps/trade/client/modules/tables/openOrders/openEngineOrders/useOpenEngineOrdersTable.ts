import { removeDecimals } from '@nadohq/client';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useFilteredProductIds } from 'client/hooks/markets/useFilteredProductIds';
import { useQuerySubaccountOpenEngineOrders } from 'client/hooks/query/subaccount/useQuerySubaccountOpenEngineOrders';
import { OpenEngineOrderTableItem } from 'client/modules/tables/types/OpenEngineOrderTableItem';
import { getOrderTableItem } from 'client/modules/tables/utils/getOrderTableItem';
import { getProductTableItem } from 'client/modules/tables/utils/getProductTableItem';
import { QueryState } from 'client/types/QueryState';
import { secondsToMilliseconds } from 'date-fns';
import { useMemo } from 'react';

export function useOpenEngineOrdersTable(
  productIds?: number[],
): QueryState<OpenEngineOrderTableItem[]> {
  const { filteredProductIds, isLoading: marketsAreLoading } =
    useFilteredProductIds({ productIds });
  const {
    isLoading: ordersAreLoading,
    isError: ordersIsError,
    data: ordersData,
  } = useQuerySubaccountOpenEngineOrders();
  const { data: allMarketsStaticData } = useAllMarketsStaticData();

  const openEngineOrders = useMemo(() => {
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

      return ordersForProduct.map(
        (openEngineOrder): OpenEngineOrderTableItem => {
          const orderTableItem = getOrderTableItem({
            engineOrder: openEngineOrder,
          });

          const decimalAdjustedUnfilledAmount = removeDecimals(
            openEngineOrder.unfilledAmount,
          );
          const decimalAdjustedFilledAmount =
            orderTableItem.totalBaseAmount.minus(decimalAdjustedUnfilledAmount);

          const { productId, digest } = openEngineOrder;
          const orderDisplayType = 'limit'; // open engine orders can only be limit

          return {
            ...productTableItem,
            ...orderTableItem,
            timePlacedMillis: secondsToMilliseconds(
              openEngineOrder.placementTime,
            ),
            filledBaseSize: decimalAdjustedFilledAmount.abs(),
            orderForCancellation: {
              productId,
              digest,
              decimalAdjustedTotalAmount: orderTableItem.totalBaseAmount,
              isTrigger: false,
              orderDisplayType,
            },
          };
        },
      );
    });
  }, [allMarketsStaticData, filteredProductIds, ordersData]);

  return {
    data: openEngineOrders,
    isLoading: ordersAreLoading || marketsAreLoading,
    isError: ordersIsError,
  };
}
