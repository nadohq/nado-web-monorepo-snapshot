import { ChainEnv } from '@nadohq/client';
import { USDT0_INK, USDT0_INK_SEPOLIA } from './ink';
import { USDT0_HARDHAT } from './local';
import { Token } from './types';

export const PRIMARY_QUOTE_TOKEN_BY_CHAIN_ENV: Record<ChainEnv, Token> = {
  inkMainnet: USDT0_INK,
  inkTestnet: USDT0_INK_SEPOLIA,
  local: USDT0_HARDHAT,
};
