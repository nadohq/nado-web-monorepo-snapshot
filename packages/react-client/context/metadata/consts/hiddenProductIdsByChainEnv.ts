import { ChainEnv, NLP_PRODUCT_ID } from '@nadohq/client';
import { DELISTED_PRODUCT_IDS } from './productDelisting';

export const HIDDEN_PRODUCT_IDS_BY_CHAIN_ENV: Record<ChainEnv, Set<number>> = {
  inkMainnet: new Set([
    ...DELISTED_PRODUCT_IDS,
    NLP_PRODUCT_ID,
    // USELESS
    42,
    // SKR
    44,
  ]),
  inkTestnet: new Set([
    ...DELISTED_PRODUCT_IDS,
    NLP_PRODUCT_ID,
    // USELESS
    42,
    // SKR
    44,
  ]),
  local: new Set([...DELISTED_PRODUCT_IDS, NLP_PRODUCT_ID]),
};
