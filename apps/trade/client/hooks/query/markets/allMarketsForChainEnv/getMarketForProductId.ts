import { NLP_PRODUCT_ID, QUOTE_PRODUCT_ID } from '@nadohq/client';
import { AnnotatedMarket } from '@nadohq/react-client';
import { AllMarketsForChainEnv } from 'client/hooks/query/markets/allMarketsForChainEnv/types';

export function getMarketForProductId<
  T extends AnnotatedMarket = AnnotatedMarket,
>(
  productId: number,
  dataForChainEnv: AllMarketsForChainEnv | undefined,
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
