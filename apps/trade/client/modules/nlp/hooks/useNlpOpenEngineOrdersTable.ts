import { removeDecimals } from '@nadohq/client';
import { toXStocksDisplayAmount } from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useQueryNlpPools } from 'client/hooks/query/nlp/useQueryNlpPools';
import { NlpOpenEngineOrdersTableItem } from 'client/modules/nlp/types/NlpOpenEngineOrdersTableItem';
import { getOrderTableItem } from 'client/modules/tables/utils/getOrderTableItem';
import { getProductTableItem } from 'client/modules/tables/utils/getProductTableItem';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
import { secondsToMilliseconds } from 'date-fns';
import { useMemo } from 'react';

export function useNlpOpenEngineOrdersTable() {
  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const { data: nlpPools, isLoading: isLoadingPools } = useQueryNlpPools();
  const { getExchangeRate } = useGetXStocksExchangeRate();

  const mappedData = useMemo(() => {
    if (!nlpPools || !allMarketsStaticData) {
      return undefined;
    }

    return nlpPools.nlpPools.flatMap((pool): NlpOpenEngineOrdersTableItem[] => {
      return pool.openOrders
        .map((engineOrder) => {
          const exchangeRate = getExchangeRate(engineOrder.productId);
          const productTableItem = getProductTableItem({
            productId: engineOrder.productId,
            allMarketsStaticData,
            exchangeRate,
          });

          if (!productTableItem) {
            return undefined;
          }

          const orderTableItem = getOrderTableItem({
            engineOrder,
            exchangeRate,
          });

          const decimalAdjustedFilledAmount = removeDecimals(
            engineOrder.totalAmount.minus(engineOrder.unfilledAmount),
          );

          return {
            ...productTableItem,
            ...orderTableItem,
            timePlacedMillis: secondsToMilliseconds(engineOrder.placementTime),
            filledBaseSize: toXStocksDisplayAmount(
              decimalAdjustedFilledAmount,
              exchangeRate,
            ).abs(),
          };
        })
        .filter(nonNullFilter);
    });
  }, [nlpPools, allMarketsStaticData, getExchangeRate]);

  return {
    orders: mappedData,
    isLoading: isLoadingPools,
  };
}
