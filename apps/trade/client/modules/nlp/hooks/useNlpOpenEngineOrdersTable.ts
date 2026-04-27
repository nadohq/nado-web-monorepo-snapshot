import { removeDecimals } from '@nadohq/client';
import { nonNullFilter } from '@nadohq/web-common';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useQueryNlpPools } from 'client/hooks/query/nlp/useQueryNlpPools';
import { NlpOpenEngineOrdersTableItem } from 'client/modules/nlp/types/NlpOpenEngineOrdersTableItem';
import { getOrderTableItem } from 'client/modules/tables/utils/getOrderTableItem';
import { getProductTableItem } from 'client/modules/tables/utils/getProductTableItem';
import { secondsToMilliseconds } from 'date-fns';
import { useMemo } from 'react';

export function useNlpOpenEngineOrdersTable() {
  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const { data: nlpPools, isLoading: isLoadingPools } = useQueryNlpPools();

  const mappedData = useMemo(() => {
    if (!nlpPools || !allMarketsStaticData) {
      return undefined;
    }

    return nlpPools.nlpPools.flatMap((pool): NlpOpenEngineOrdersTableItem[] => {
      return pool.openOrders
        .map((engineOrder) => {
          const productTableItem = getProductTableItem({
            productId: engineOrder.productId,
            allMarketsStaticData,
          });

          if (!productTableItem) {
            return undefined;
          }

          const orderTableItem = getOrderTableItem({
            engineOrder,
          });

          const decimalAdjustedUnfilledAmount = removeDecimals(
            engineOrder.unfilledAmount,
          );
          const decimalAdjustedFilledAmount =
            orderTableItem.totalBaseAmount.minus(decimalAdjustedUnfilledAmount);

          return {
            ...productTableItem,
            ...orderTableItem,
            timePlacedMillis: secondsToMilliseconds(engineOrder.placementTime),
            filledBaseSize: decimalAdjustedFilledAmount.abs(),
          };
        })
        .filter(nonNullFilter);
    });
  }, [nlpPools, allMarketsStaticData]);

  return {
    orders: mappedData,
    isLoading: isLoadingPools,
  };
}
