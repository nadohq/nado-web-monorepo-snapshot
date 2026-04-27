import { ALL_CHAIN_ENVS, ChainEnv, mapValues } from '@nadohq/client';
import {
  HIDDEN_PRODUCT_IDS_BY_CHAIN_ENV,
  NEW_PRODUCT_IDS_BY_CHAIN_ENV,
  PERP_METADATA_BY_CHAIN_ENV,
  PerpProductMetadata,
  PRIMARY_QUOTE_TOKEN_BY_CHAIN_ENV,
  SPOT_METADATA_BY_CHAIN_ENV,
  SpotProductMetadata,
  Token,
  TokenIconMetadata,
} from '@nadohq/react-client';
import { NextResponse } from 'next/server';

// Same shape as SpotProductMetadata / PerpProductMetadata; marketCategories serialized as string[] (Set is not JSON-serializable).
// ImageSrc allows string, so icon.asset can be the resolved URL string.

type APIPerpProductMetadata = Omit<PerpProductMetadata, 'marketCategories'> & {
  marketCategories: string[];
};

type APISpotProductMetadata = Omit<SpotProductMetadata, 'marketCategories'> & {
  marketCategories: string[];
};

interface APIProductMetadataResponse {
  perp: Record<string, APIPerpProductMetadata>;
  spot: Record<string, APISpotProductMetadata>;
  primaryQuoteToken: Token;
  hiddenProductIds: number[];
  newProductIds: number[];
}

/** Precompute serializable metadata for all chain envs */
const metadata: Record<ChainEnv, APIProductMetadataResponse> =
  ALL_CHAIN_ENVS.reduce(
    (acc, chainEnv) => {
      acc[chainEnv] = {
        /* transform perp metadata for serialization */
        perp: mapValues(PERP_METADATA_BY_CHAIN_ENV[chainEnv], (m) => {
          const out: APIPerpProductMetadata = {
            marketName: m.marketName,
            symbol: m.symbol,
            icon: { asset: getIconUrl(m.icon) },
            altSearchTerms: m.altSearchTerms,
            quoteProductId: m.quoteProductId,
            marketCategories: Array.from(m.marketCategories),
          };
          return out;
        }),

        /* transform spot metadata for serialization */
        spot: mapValues(SPOT_METADATA_BY_CHAIN_ENV[chainEnv], (m) => {
          const token: SpotProductMetadata['token'] = {
            ...m.token,
            icon: { asset: getIconUrl(m.token.icon) },
          };
          return {
            token,
            quoteProductId: m.quoteProductId,
            marketName: m.marketName,
            altSearchTerms: m.altSearchTerms,
            marketCategories: Array.from(m.marketCategories),
          };
        }),
        primaryQuoteToken: PRIMARY_QUOTE_TOKEN_BY_CHAIN_ENV[chainEnv],
        hiddenProductIds: Array.from(HIDDEN_PRODUCT_IDS_BY_CHAIN_ENV[chainEnv]),
        newProductIds: Array.from(NEW_PRODUCT_IDS_BY_CHAIN_ENV[chainEnv]),
      };
      return acc;
    },
    {} as Record<ChainEnv, APIProductMetadataResponse>,
  );

export async function GET() {
  return NextResponse.json(metadata, { status: 200 });
}

function getIconUrl(icon: TokenIconMetadata): string {
  if (typeof icon.asset === 'string') {
    return icon.asset;
  } else if ('src' in icon.asset) {
    return icon.asset.src;
  }
  return icon.asset.toString();
}
