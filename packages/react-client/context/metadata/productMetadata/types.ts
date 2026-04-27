import {
  PerpBalanceWithProduct,
  PerpMarket,
  SpotBalanceWithProduct,
  SpotMarket,
  SubaccountIsolatedPosition,
} from '@nadohq/client';
import { Address } from 'viem';
import { ImageSrc, MetadataContextImageSrc } from '../../../types/ImageSrc';
import { TokenIconMetadata } from './tokenIcons';

export interface SharedProductMetadata<TAsset = ImageSrc> {
  marketName: string;
  symbol: string;
  icon: TokenIconMetadata<TAsset>;
  /**
   * Alternative search terms associated with the market.
   */
  altSearchTerms: string[];
}

export interface Token<TAsset = ImageSrc> {
  tokenDecimals: number; // Backend / contracts normalize to the same decimal places, so we have to track the decimals of the underlying token separately
  address: Address;
  chainId: number;
  symbol: string;
  icon: TokenIconMetadata<TAsset>;
}

export type MarketCategory =
  | 'spot'
  | 'perp'
  | 'meme'
  | 'defi'
  | 'chain'
  | 'commodity'
  | 'equities'
  | 'forex'
  | 'indices';

export interface SpotProductMetadata<TAsset = ImageSrc> {
  token: Token<TAsset>;
  /** For usual cases, this is the product ID of 0 */
  quoteProductId: number;
  marketName: string;
  /**
   * Alternative search terms associated with the market.
   */
  altSearchTerms: string[];
  marketCategories: Set<MarketCategory>;
}

export interface PerpProductMetadata<
  TAsset = ImageSrc,
> extends SharedProductMetadata<TAsset> {
  /** For usual cases, this is the product ID of 0 */
  quoteProductId: number;
  marketCategories: Set<MarketCategory>;
}

export interface AnnotatedSpotBalanceWithProduct extends SpotBalanceWithProduct {
  metadata: SpotProductMetadata<MetadataContextImageSrc>;
}

export interface AnnotatedPerpBalanceWithProduct extends PerpBalanceWithProduct {
  metadata: PerpProductMetadata<MetadataContextImageSrc>;
}

export interface AnnotatedIsolatedPositionWithProduct extends Omit<
  SubaccountIsolatedPosition,
  'baseBalance' | 'quoteBalance'
> {
  baseBalance: AnnotatedPerpBalanceWithProduct;
  quoteBalance: AnnotatedSpotBalanceWithProduct;
}

export type AnnotatedBalanceWithProduct =
  | AnnotatedSpotBalanceWithProduct
  | AnnotatedPerpBalanceWithProduct;

export interface AnnotatedSpotMarket extends SpotMarket {
  metadata: SpotProductMetadata<MetadataContextImageSrc>;
  isHidden: boolean;
  isNew: boolean;
}

export interface AnnotatedPerpMarket extends PerpMarket {
  metadata: PerpProductMetadata<MetadataContextImageSrc>;
  maxLeverage: number;
  isHidden: boolean;
  isNew: boolean;
}

export type AnnotatedMarket = AnnotatedSpotMarket | AnnotatedPerpMarket;
