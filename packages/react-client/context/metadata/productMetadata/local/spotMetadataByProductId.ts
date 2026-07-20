import { QUOTE_PRODUCT_ID } from '@nadohq/client';
import { COMMON_ALT_SEARCH_TERMS } from '../commonAltSearchTerms';
import { KBTC_HARDHAT, USDT0_HARDHAT, WETH_HARDHAT } from '../local/tokens';
import { MARKET_DESCRIPTIONS } from '../marketDescriptions';
import { PRIMARY_QUOTE_SYMBOLS } from '../primaryQuoteSymbols';
import { SpotProductMetadata } from '../types';

export const HARDHAT_SPOT_METADATA_BY_PRODUCT_ID: Record<
  number,
  SpotProductMetadata
> = {
  [QUOTE_PRODUCT_ID]: {
    token: USDT0_HARDHAT,
    marketName: '',
    fullMarketName: 'USDT0',
    marketDescription: MARKET_DESCRIPTIONS.usdt0,
    altSearchTerms: [],
    quoteProductId: QUOTE_PRODUCT_ID,
    marketCategories: new Set(['crypto']),
  },
  1: {
    token: KBTC_HARDHAT,
    marketName: `kBTC/${PRIMARY_QUOTE_SYMBOLS.usdt0}`,
    fullMarketName: 'Kraken Wrapped Bitcoin',
    marketDescription: MARKET_DESCRIPTIONS.kbtc,
    altSearchTerms: COMMON_ALT_SEARCH_TERMS.kbtc,
    quoteProductId: QUOTE_PRODUCT_ID,
    marketCategories: new Set(['crypto']),
  },
  3: {
    token: WETH_HARDHAT,
    marketName: `wETH/${PRIMARY_QUOTE_SYMBOLS.usdt0}`,
    fullMarketName: 'Wrapped Ether',
    marketDescription: MARKET_DESCRIPTIONS.weth,
    altSearchTerms: COMMON_ALT_SEARCH_TERMS.weth,
    quoteProductId: QUOTE_PRODUCT_ID,
    marketCategories: new Set(['crypto']),
  },
};
