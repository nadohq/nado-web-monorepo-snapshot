import { removeDecimals } from '@nadohq/client';
import { toXStocksDisplayAmount } from '@nadohq/react-client';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useFilteredProductIds } from 'client/hooks/markets/useFilteredProductIds';
import { useQuerySubaccountOpenEngineOrders } from 'client/hooks/query/subaccount/useQuerySubaccountOpenEngineOrders';
import { OpenEngineOrderTableItem } from 'client/modules/tables/types/OpenEngineOrderTableItem';
import { getOrderTableItem } from 'client/modules/tables/utils/getOrderTableItem';
import { getProductTableItem } from 'client/modules/tables/utils/getProductTableItem';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
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
  const { getExchangeRate } = useGetXStocksExchangeRate();

  const openEngineOrders = useMemo(() => {
    if (!ordersData || !allMarketsStaticData) {
      return;
    }

    return filteredProductIds.flatMap((productId) => {
      const ordersForProduct = ordersData?.[productId];
      const exchangeRate = getExchangeRate(productId);
      const productTableItem = getProductTableItem({
        productId,
        allMarketsStaticData,
        exchangeRate,
      });

      if (!ordersForProduct?.length || !productTableItem) {
        return [];
      }

      return ordersForProduct.map(
        (openEngineOrder): OpenEngineOrderTableItem => {
          const orderTableItem = getOrderTableItem({
            engineOrder: openEngineOrder,
            exchangeRate,
          });

          // Use raw amounts to compute the filled delta before applying the display conversion
          const rawTotalBaseAmount = removeDecimals(
            openEngineOrder.totalAmount,
          );
          const rawUnfilledAmount = removeDecimals(
            openEngineOrder.unfilledAmount,
          );
          const rawFilledAmount = rawTotalBaseAmount.minus(rawUnfilledAmount);

          const { digest } = openEngineOrder;
          const orderDisplayType = 'limit'; // open engine orders can only be limit

          return {
            ...productTableItem,
            ...orderTableItem,
            timePlacedMillis: secondsToMilliseconds(
              openEngineOrder.placementTime,
            ),
            filledBaseSize: toXStocksDisplayAmount(
              rawFilledAmount.abs(),
              exchangeRate,
            ),
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
  }, [allMarketsStaticData, filteredProductIds, ordersData, getExchangeRate]);

  return {
    data: openEngineOrders,
    isLoading: ordersAreLoading || marketsAreLoading,
    isError: ordersIsError,
  };
}
