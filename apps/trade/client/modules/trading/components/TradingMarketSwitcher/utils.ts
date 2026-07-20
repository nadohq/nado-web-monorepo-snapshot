import {
  BigNumbers,
  GetIndexerMultiProductFundingRatesResponse,
  ProductEngineType,
  removeDecimals,
} from '@nadohq/client';
import {
  getFundingRates,
  getMarketPriceFormatSpecifier,
  toXStocksDisplayPrice,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { MarketPointsBoost } from 'client/hooks/markets/useAllMarketsPointsBoosts';
import { AllMarketsStats } from 'client/hooks/markets/useAllMarketsStats';
import { StaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { AllLatestMarketPricesData } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { MarketSwitcherItem } from 'client/modules/trading/components/TradingMarketSwitcher/types';
import { bigNumberComparator } from 'client/utils/comparators';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import { get } from 'lodash';

export interface GetMappedMarketParams {
  market: StaticMarketData;
  latestMarketPrices: AllLatestMarketPricesData | undefined;
  marketStats: AllMarketsStats | undefined;
  fundingRates: GetIndexerMultiProductFundingRatesResponse | undefined;
  isFavoritedMarket: boolean;
  href: string;
  pointsBoost: MarketPointsBoost | undefined;
  exchangeRate: BigNumber;
  isXStock: boolean;
  isZeroFeesMarket: boolean;
}

export function getMappedMarket({
  market,
  latestMarketPrices,
  marketStats,
  fundingRates,
  isFavoritedMarket,
  href,
  pointsBoost,
  exchangeRate,
  isXStock,
  isZeroFeesMarket,
}: GetMappedMarketParams): MarketSwitcherItem {
  const { productId, metadata, priceIncrement, type: productType } = market;
  const { marketCategories: categories, altSearchTerms } = metadata;
  const { marketName, symbol, icon } = getSharedProductMetadata(metadata);
  const currentPrice = toXStocksDisplayPrice(
    latestMarketPrices?.[productId]?.safeMidPrice,
    exchangeRate,
  );
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
    pointsBoost,
    currentPrice,
    priceChangeFrac,
    priceFormatSpecifier: getMarketPriceFormatSpecifier({
      priceIncrement,
      exchangeRate,
    }),
    annualizedFundingFrac,
    volume24h,
    maxLeverage,
    isXStock,
    isZeroFees: isZeroFeesMarket,
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
