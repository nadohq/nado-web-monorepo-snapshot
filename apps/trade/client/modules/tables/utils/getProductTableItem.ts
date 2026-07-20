import { ProductEngineType } from '@nadohq/client';
import {
  getMarketPriceFormatSpecifier,
  getMarketSizeFormatSpecifier,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { AllMarketsStaticDataForChainEnv } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { ProductTableItem } from 'client/modules/tables/types/ProductTableItem';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';

interface Params {
  productId: number;
  allMarketsStaticData: AllMarketsStaticDataForChainEnv;
  exchangeRate: BigNumber;
}

export function getProductTableItem({
  productId,
  allMarketsStaticData,
  exchangeRate,
}: Params): ProductTableItem {
  const market = allMarketsStaticData.allMarkets[productId];
  const quoteData = allMarketsStaticData.quotes[productId];

  if (!market || !quoteData) {
    throw new Error(`No market or quote data for productId ${productId}`);
  }

  const { symbol } = getSharedProductMetadata(
    allMarketsStaticData.allMarkets[productId].metadata,
  );

  return {
    productId,
    productType: market.type,
    isPerp: market.type === ProductEngineType.PERP,
    productName: market.metadata.marketName,
    baseSymbol: symbol,
    quoteSymbol: quoteData.symbol,
    isPrimaryQuote: quoteData.isPrimaryQuote,
    formatSpecifier: {
      size: getMarketSizeFormatSpecifier({
        sizeIncrement: market.sizeIncrement,
        exchangeRate,
      }),
      price: getMarketPriceFormatSpecifier({
        priceIncrement: market.priceIncrement,
        exchangeRate,
      }),
    },
  };
}
