import {
  BigNumbers,
  GetIndexerMultiProductFundingRatesResponse,
  ProductEngineType,
  removeDecimals,
} from '@nadohq/client';
import { getFundingRates } from '@nadohq/react-client';
import { AllMarketsStats } from 'client/hooks/markets/useAllMarketsStats';
import { StaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { AllLatestMarketPricesData } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { MarketSwitcherItem } from 'client/modules/trading/components/TradingMarketSwitcher/types';
import { bigNumberComparator } from 'client/utils/comparators';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import { get } from 'lodash';

export function getMappedMarket(
  market: StaticMarketData,
  latestMarketPrices: AllLatestMarketPricesData | undefined,
  marketStats: AllMarketsStats | undefined,
  fundingRates: GetIndexerMultiProductFundingRatesResponse | undefined,
  isFavoritedMarket: boolean,
  href: string,
): MarketSwitcherItem {
  const { productId, metadata, priceIncrement, type: productType } = market;
  const { marketCategories: categories, altSearchTerms } = metadata;
  const { marketName, symbol, icon } = getSharedProductMetadata(metadata);
  const currentPrice = latestMarketPrices?.[productId]?.safeMidPrice;
  const priceChangeFrac =
    marketStats?.statsByMarket[productId]?.pastDayPriceChangeFrac;
  const volume24h = removeDecimals(
    marketStats?.statsByMarket[productId]?.pastDayVolumeInPrimaryQuote,
  );
  const dailyFundingRate = get(fundingRates, market.productId)?.fundingRate;
  const maxLeverage =
    market.type === ProductEngineType.PERP ? market.maxLeverage : undefined;

  const annualizedFundingFrac = dailyFundingRate
    ? getFundingRates(dailyFundingRate)['1y']
    : undefined;

  return {
    market: {
      productType,
      symbol,
      marketName,
      icon,
      categories,
      altSearchTerms,
    },
    currentPrice,
    priceChangeFrac,
    priceIncrement,
    annualizedFundingFrac,
    volume24h,
    maxLeverage,
    isNew: market.isNew,
    isFavorited: isFavoritedMarket,
    productId,
    href,
    rowId: String(productId),
  };
}

export function volumeComparator(a: MarketSwitcherItem, b: MarketSwitcherItem) {
  const volumeA = a.volume24h ?? BigNumbers.ZERO;
  const volumeB = b.volume24h ?? BigNumbers.ZERO;

  // Sort in desc order.
  return bigNumberComparator(volumeA, volumeB) * -1;
}
