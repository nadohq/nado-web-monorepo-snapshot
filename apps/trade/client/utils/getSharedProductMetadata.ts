import {
  PerpProductMetadata,
  SharedProductMetadata,
  SpotProductMetadata,
} from '@nadohq/react-client';

/**
 * Get the shared product metadata
 * @param metadata - SpotProductMetadata | PerpProductMetadata
 * @returns the shared metadata between both spot and perp products - SharedProductMetadata
 * */
export function getSharedProductMetadata(
  metadata: SpotProductMetadata | PerpProductMetadata,
): SharedProductMetadata {
  if ('token' in metadata) {
    return {
      marketName: metadata.marketName,
      symbol: metadata.token.symbol,
      icon: metadata.token.icon,
      altSearchTerms: metadata.altSearchTerms,
    };
  }
  return {
    marketName: metadata.marketName,
    symbol: metadata.symbol,
    icon: metadata.icon,
    altSearchTerms: metadata.altSearchTerms,
  };
}
