import { removeDecimals } from '@nadohq/client';
import {
  getMarketPriceFormatSpecifier,
  MarketCategory,
  NumberFormatSpecifier,
  PerpProductMetadata,
  SpotProductMetadata,
  toXStocksDisplayPrice,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { useAllMarketsStats } from 'client/hooks/markets/useAllMarketsStats';
import { useFavoritedMarkets } from 'client/hooks/markets/useFavoritedMarkets';
import { useQueryAllMarketsLatestPrices } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { usePushTradePage } from 'client/hooks/ui/navigation/usePushTradePage';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
import { useMemo } from 'react';

export interface MarketTableItem extends WithDataTableRowId {
  metadata: SpotProductMetadata | PerpProductMetadata;
  productId: number;
  price: {
    currentPrice: BigNumber | undefined;
    priceChangeFrac24h: BigNumber | undefined;
    marketPriceFormatSpecifier: NumberFormatSpecifier;
  };
  pastDayVolumeInPrimaryQuote: BigNumber | undefined;
  isFavorited: boolean;
  action: () => void;
  searchKey: string;
  type: 'markets';
}

interface Params {
  marketCategory: MarketCategory | undefined;
}

export function useCommandCenterMarketItems({ marketCategory }: Params) {
  const { data: allMarketsData } = useAllMarkets();
  const { data: latestMarketPricesData } = useQueryAllMarketsLatestPrices();
  const { data: marketStatsData } = useAllMarketsStats();
  const { favoritedMarketIds } = useFavoritedMarkets();

  const pushTradePage = usePushTradePage();
  const { getExchangeRate } = useGetXStocksExchangeRate();

  const mappedData: MarketTableItem[] = useMemo(() => {
    if (!allMarketsData) {
      return [];
    }
    return Object.values(allMarketsData.allMarkets)
      .filter((market) => !market.isHidden)
      .filter(
        (market) =>
          !marketCategory ||
          market.metadata.marketCategories.has(marketCategory),
      )
      .map((market) => {
        const productId = market.productId;
        const marketStats = marketStatsData?.statsByMarket[productId];
        const latestMarketPrices = latestMarketPricesData?.[productId];
        const exchangeRate = getExchangeRate(productId);

        return {
          rowId: String(productId),
          metadata: market.metadata,
          productId: market.productId,
          price: {
            currentPrice: toXStocksDisplayPrice(
              latestMarketPrices?.safeMidPrice,
              exchangeRate,
            ),
            priceChangeFrac24h: marketStats?.pastDayPriceChangeFrac,
            marketPriceFormatSpecifier: getMarketPriceFormatSpecifier({
              priceIncrement: market.priceIncrement,
              exchangeRate: getExchangeRate(market.productId),
            }),
          },
          pastDayVolumeInPrimaryQuote: removeDecimals(
            marketStats?.pastDayVolumeInPrimaryQuote,
          ),
          isFavorited: favoritedMarketIds.has(market.productId),
          action: () => {
            pushTradePage({ productId: market.productId });
          },
          searchKey: market.metadata.marketName,
          type: 'markets',
        };
      });
  }, [
    allMarketsData,
    marketCategory,
    marketStatsData?.statsByMarket,
    latestMarketPricesData,
    favoritedMarketIds,
    pushTradePage,
    getExchangeRate,
  ]);

  return { markets: mappedData };
}
