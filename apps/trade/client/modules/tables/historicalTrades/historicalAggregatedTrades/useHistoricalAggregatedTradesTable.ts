import { GetIndexerPaginatedOrdersResponse } from '@nadohq/client';
import { nonNullFilter } from '@nadohq/web-common';
import { useDataTablePaginatedQuery } from 'client/components/DataTable/hooks/useDataTablePaginatedQuery';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { usePaginatedSubaccountHistoricalEngineOrders } from 'client/hooks/query/subaccount/usePaginatedSubaccountHistoricalEngineOrders';
import { getHistoricalEngineOrderTableItem } from 'client/modules/tables/historicalOrders/historicalEngineOrders/useHistoricalEngineOrdersTable';
import { HistoricalEngineOrderTableItem } from 'client/modules/tables/types/HistoricalEngineOrderTableItem';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

function extractItems(data: GetIndexerPaginatedOrdersResponse) {
  return data.orders;
}

interface Params {
  pageSize: number;
  productIds?: number[];
}

export function useHistoricalAggregatedTradesTable({
  pageSize,
  productIds,
}: Params) {
  const { t } = useTranslation();

  const { data: allMarketsStaticData, isLoading: marketsDataLoading } =
    useAllMarketsStaticData();

  const {
    isLoading,
    isFetchingCurrPage,
    currentPageData: historicalOrders,
    pagination,
  } = useDataTablePaginatedQuery({
    queryHook: usePaginatedSubaccountHistoricalEngineOrders,
    queryParams: {
      pageSize,
      productIds,
      includeTriggerOrders: true,
    },
    extractItems,
  });

  const mappedData: HistoricalEngineOrderTableItem[] | undefined =
    useMemo(() => {
      if (!historicalOrders || !allMarketsStaticData) {
        return;
      }

      return historicalOrders
        .map((order): HistoricalEngineOrderTableItem | undefined => {
          const staticMarketData =
            allMarketsStaticData.allMarkets[order.productId];
          const staticQuoteData = allMarketsStaticData.quotes[order.productId];

          if (!staticMarketData || !staticQuoteData) {
            return;
          }

          return getHistoricalEngineOrderTableItem({
            order,
            allMarketsStaticData,
            t,
          });
        })
        .filter(nonNullFilter);
    }, [historicalOrders, allMarketsStaticData, t]);

  return {
    isLoading: isLoading || marketsDataLoading || isFetchingCurrPage,
    mappedData,
    pagination,
  };
}
