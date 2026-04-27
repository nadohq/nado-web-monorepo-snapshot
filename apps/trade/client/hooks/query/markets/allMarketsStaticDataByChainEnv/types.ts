import { ProductEngineType } from '@nadohq/client';
import { PerpProductMetadata, SpotProductMetadata } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';

interface CommonStaticMarketData {
  productId: number;
  isHidden: boolean;
  isNew: boolean;
  minSize: BigNumber;
  priceIncrement: BigNumber;
  sizeIncrement: BigNumber;
  longWeightInitial: BigNumber;
  shortWeightInitial: BigNumber;
  longWeightMaintenance: BigNumber;
  shortWeightMaintenance: BigNumber;
}

export interface PerpStaticMarketData extends CommonStaticMarketData {
  type: ProductEngineType.PERP;
  metadata: PerpProductMetadata;
  maxLeverage: number;
}

export interface SpotStaticMarketData extends CommonStaticMarketData {
  type: ProductEngineType.SPOT;
  metadata: SpotProductMetadata;
}

export type StaticMarketData = SpotStaticMarketData | PerpStaticMarketData;

/**
 * Metadata corresponding to the quote currency for a given market. This is a more restrictive type than StaticMarketData
 * as we anticipate that future perp quotes may not actually be markets themselves (this is a bit unknown currently)
 */
export interface StaticMarketQuoteData {
  productId: number;
  isPrimaryQuote: boolean;
  symbol: string;
}

export interface AllMarketsStaticDataForChainEnv {
  primaryQuoteProduct: SpotStaticMarketData;
  nlpProduct: SpotStaticMarketData | undefined;
  /**
   * Product ID -> data
   */
  allMarkets: Record<number, StaticMarketData>;
  /**
   * This includes all spot markets as well as primary quote / NLP
   */
  spotProducts: Record<number, SpotStaticMarketData>;
  /**
   * This excludes primary quote & NLP because they do not have markets
   */
  spotMarkets: Record<number, SpotStaticMarketData>;
  perpMarkets: Record<number, PerpStaticMarketData>;
  /**
   * Product ID -> quote metadata for the market
   */
  quotes: Record<number, StaticMarketQuoteData>;
  allMarketsProductIds: number[];
  spotMarketsProductIds: number[];
  perpMarketsProductIds: number[];
}
