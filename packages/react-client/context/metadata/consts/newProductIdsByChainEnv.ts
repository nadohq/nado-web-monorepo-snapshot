import { ChainEnv } from '@nadohq/client';

export const NEW_PRODUCT_IDS_BY_CHAIN_ENV: Record<ChainEnv, Set<number>> = {
  inkMainnet: new Set([158]),
  inkTestnet: new Set([158]),
  local: new Set(),
};
