import { removeDecimals } from '@nadohq/client';
import {
  getMarketPriceFormatSpecifier,
  MarketCategory,
  PerpProductMetadata,
  SpotProductMetadata,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { useAllMarketsStats } from 'client/hooks/markets/useAllMarketsStats';
import { useFavoritedMarkets } from 'client/hooks/markets/useFavoritedMarkets';
import { useQueryAllMarketsLatestPrices } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { usePushTradePage } from 'client/hooks/ui/navigation/usePushTradePage';
import { useMemo } from 'react';

export interface MarketTableItem extends WithDataTableRowId {
  metadata: SpotProductMetadata | PerpProductMetadata;
  productId: number;
  price: {
    currentPrice: BigNumber | undefined;
    priceChangeFrac24h: BigNumber | undefined;
    marketPriceFormatSpecifier: string;
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

        return {
          rowId: String(productId),
          metadata: market.metadata,
          productId: market.productId,
          price: {
            currentPrice: latestMarketPrices?.safeMidPrice,
            priceChangeFrac24h: marketStats?.pastDayPriceChangeFrac,
            marketPriceFormatSpecifier: getMarketPriceFormatSpecifier(
              market.priceIncrement,
            ),
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
  ]);

  return { markets: mappedData };
}
