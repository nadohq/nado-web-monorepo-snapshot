import {
  AnnotatedMarket,
  AnnotatedPerpMarket,
  AnnotatedSpotMarket,
} from '@nadohq/react-client';

export interface AllMarketsForChainEnv {
  /**
   * This is a market for typing purposes but only the product is relevant
   */
  primaryQuoteProduct: AnnotatedSpotMarket;
  /**
   * This is also a market for typing purposes only, but only the product is relevant because NLP does not have a spot market
   */
  nlpProduct: AnnotatedSpotMarket | undefined;
  /**
   * Registered markets from product id -> data
   */
  allMarkets: Record<number, AnnotatedMarket>;
  /**
   * This includes all spot markets as well as primary quote / NLP
   */
  spotProducts: Record<number, AnnotatedSpotMarket>;
  /**
   * This excludes primary quote & NLP because they do not have markets
   */
  spotMarkets: Record<number, AnnotatedSpotMarket>;
  perpMarkets: Record<number, AnnotatedPerpMarket>;
  allMarketsProductIds: number[];
  spotMarketsProductIds: number[];
  perpMarketsProductIds: number[];
}
