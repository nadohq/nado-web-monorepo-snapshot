import { zeroAddress } from 'viem';
import { hardhat } from 'viem/chains';
import { PRIMARY_QUOTE_SYMBOLS } from '../primaryQuoteSymbols';
import { TOKEN_ICONS } from '../tokenIcons';
import { Token } from '../types';

const hardhatChainId = hardhat.id;

export const USDT0_HARDHAT: Token = {
  address: zeroAddress,
  chainId: hardhatChainId,
  tokenDecimals: 6,
  symbol: PRIMARY_QUOTE_SYMBOLS.usdt0,
  icon: TOKEN_ICONS.usdt0,
};

export const KBTC_HARDHAT: Token = {
  address: zeroAddress,
  chainId: hardhatChainId,
  tokenDecimals: 8,
  symbol: 'kBTC',
  icon: TOKEN_ICONS.kbtc,
};

export const WETH_HARDHAT: Token = {
  address: zeroAddress,
  chainId: hardhatChainId,
  tokenDecimals: 18,
  symbol: 'wETH',
  icon: TOKEN_ICONS.weth,
};
