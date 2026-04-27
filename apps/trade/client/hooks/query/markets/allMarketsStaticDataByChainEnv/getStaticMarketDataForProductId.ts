import { NLP_PRODUCT_ID, QUOTE_PRODUCT_ID } from '@nadohq/client';
import {
  AllMarketsStaticDataForChainEnv,
  StaticMarketData,
} from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';

export function getStaticMarketDataForProductId<T extends StaticMarketData>(
  productId: number,
  dataForChainEnv: AllMarketsStaticDataForChainEnv | undefined,
): T | undefined {
  if (!dataForChainEnv) {
    return;
  }

  if (productId === QUOTE_PRODUCT_ID) {
    return dataForChainEnv.primaryQuoteProduct as T;
  }
  if (productId === NLP_PRODUCT_ID) {
    return dataForChainEnv.nlpProduct as T;
  }

  return dataForChainEnv.allMarkets[productId] as T;
}
