import {
  getMarketPriceFormatSpecifier,
  toXStocksDisplayPrice,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { useAllMarketsStats } from 'client/hooks/markets/useAllMarketsStats';
import { useQueryAllMarketsLatestPrices } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
import { sortByValueAndLimit } from 'client/pages/Markets/utils/sortByValueAndLimit';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import { useMemo } from 'react';

export function useMarketsRecentlyAdded() {
  const { getIsHiddenMarket } = useNadoMetadataContext();
  const { data: allMarketsData, isLoading: isLoadingAllMarkets } =
    useAllMarkets();
  const { data: marketStats } = useAllMarketsStats();
  const { data: latestPriceData, isLoading: isLoadingLatestPriceData } =
    useQueryAllMarketsLatestPrices();
  const { getExchangeRate } = useGetXStocksExchangeRate();

  const recentlyAddedMarkets = useMemo(() => {
    if (!marketStats?.statsByMarket || !latestPriceData || !allMarketsData) {
      return;
    }

    // Product IDs are sequential, so we just need to get the highest product IDs, this is done automatically by `sortByValueAndLimit`
    // as it defaults to sorting by `productId` in descending order
    const mappedMarkets = Object.values(allMarketsData.allMarkets)
      .filter((market) => !getIsHiddenMarket(market.productId))
      .map((market) => {
        const exchangeRate = getExchangeRate(market.productId);

        return {
          metadata: getSharedProductMetadata(market.metadata),
          marketPrice: toXStocksDisplayPrice(
            latestPriceData[market.productId]?.safeMidPrice,
            exchangeRate,
          ),
          priceFormatSpecifier: getMarketPriceFormatSpecifier({
            priceIncrement: market.priceIncrement,
            exchangeRate,
          }),
          marketPriceChangeFrac:
            marketStats.statsByMarket[market.productId]?.pastDayPriceChangeFrac,
          productId: market.productId,
        };
      });

    return sortByValueAndLimit(mappedMarkets, 'productId');
  }, [
    marketStats,
    latestPriceData,
    allMarketsData,
    getIsHiddenMarket,
    getExchangeRate,
  ]);

  return {
    recentlyAddedMarkets,
    isLoading: isLoadingAllMarkets || !marketStats || isLoadingLatestPriceData,
  };
}
