import { NLP_PRODUCT_ID, QUOTE_PRODUCT_ID } from '@nadohq/client';
import { COMMON_ALT_SEARCH_TERMS } from '../commonAltSearchTerms';
import { KNOWN_PRODUCT_IDS } from '../knownProductIds';
import { NLP_TOKEN_INFO } from '../nlpTokenInfo';
import { PRIMARY_QUOTE_SYMBOLS } from '../primaryQuoteSymbols';
import { SpotProductMetadata } from '../types';
import {
  KBTC_INK,
  KBTC_INK_SEPOLIA,
  NLP_INK,
  NLP_INK_SEPOLIA,
  USDC_INK,
  USDC_INK_SEPOLIA,
  USDT0_INK,
  USDT0_INK_SEPOLIA,
  WETH_INK,
  WETH_INK_SEPOLIA,
} from './tokens';

/**
 * Ink Testnet
 */

export const INK_TESTNET_SPOT_METADATA_BY_PRODUCT_ID: Record<
  number,
  SpotProductMetadata
> = {
  [QUOTE_PRODUCT_ID]: {
    token: USDT0_INK_SEPOLIA,
    marketName: '',
    altSearchTerms: [],
    quoteProductId: QUOTE_PRODUCT_ID,
    marketCategories: new Set(['spot']),
  },
  1: {
    token: KBTC_INK_SEPOLIA,
    marketName: `kBTC/${PRIMARY_QUOTE_SYMBOLS.usdt0}`,
    altSearchTerms: COMMON_ALT_SEARCH_TERMS.kbtc,
    quoteProductId: QUOTE_PRODUCT_ID,
    marketCategories: new Set(['spot', 'chain']),
  },
  [KNOWN_PRODUCT_IDS.weth]: {
    token: WETH_INK_SEPOLIA,
    marketName: `wETH/${PRIMARY_QUOTE_SYMBOLS.usdt0}`,
    altSearchTerms: COMMON_ALT_SEARCH_TERMS.weth,
    quoteProductId: QUOTE_PRODUCT_ID,
    marketCategories: new Set(['spot', 'chain']),
  },
  5: {
    token: USDC_INK_SEPOLIA,
    marketName: `USDC/${PRIMARY_QUOTE_SYMBOLS.usdt0}`,
    altSearchTerms: COMMON_ALT_SEARCH_TERMS.usdc,
    quoteProductId: QUOTE_PRODUCT_ID,
    marketCategories: new Set(['spot']),
  },
  [NLP_PRODUCT_ID]: {
    token: NLP_INK_SEPOLIA,
    marketName: NLP_TOKEN_INFO.symbol,
    altSearchTerms: COMMON_ALT_SEARCH_TERMS.nlp,
    quoteProductId: QUOTE_PRODUCT_ID,
    marketCategories: new Set(['spot']),
  },
};

/**
 * Ink
 */

export const INK_SPOT_METADATA_BY_PRODUCT_ID: Record<
  number,
  SpotProductMetadata
> = {
  [QUOTE_PRODUCT_ID]: {
    token: USDT0_INK,
    marketName: '',
    altSearchTerms: [],
    quoteProductId: QUOTE_PRODUCT_ID,
    marketCategories: new Set(['spot']),
  },
  1: {
    token: KBTC_INK,
    marketName: `kBTC/${PRIMARY_QUOTE_SYMBOLS.usdt0}`,
    altSearchTerms: COMMON_ALT_SEARCH_TERMS.kbtc,
    quoteProductId: QUOTE_PRODUCT_ID,
    marketCategories: new Set(['spot', 'chain']),
  },
  [KNOWN_PRODUCT_IDS.weth]: {
    token: WETH_INK,
    marketName: `wETH/${PRIMARY_QUOTE_SYMBOLS.usdt0}`,
    altSearchTerms: COMMON_ALT_SEARCH_TERMS.weth,
    quoteProductId: QUOTE_PRODUCT_ID,
    marketCategories: new Set(['spot', 'chain']),
  },
  5: {
    token: USDC_INK,
    marketName: `USDC/${PRIMARY_QUOTE_SYMBOLS.usdt0}`,
    altSearchTerms: COMMON_ALT_SEARCH_TERMS.usdc,
    quoteProductId: QUOTE_PRODUCT_ID,
    marketCategories: new Set(['spot']),
  },
  [NLP_PRODUCT_ID]: {
    token: NLP_INK,
    marketName: NLP_TOKEN_INFO.symbol,
    altSearchTerms: COMMON_ALT_SEARCH_TERMS.nlp,
    quoteProductId: QUOTE_PRODUCT_ID,
    marketCategories: new Set(['spot']),
  },
};
