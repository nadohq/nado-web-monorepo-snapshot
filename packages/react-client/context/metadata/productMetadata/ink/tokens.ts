import { ink, inkSepolia } from 'viem/chains';
import { NLP_TOKEN_INFO } from '../nlpTokenInfo';
import { PRIMARY_QUOTE_SYMBOLS } from '../primaryQuoteSymbols';
import { TOKEN_ICONS } from '../tokenIcons';
import { Token } from '../types';

const inkSepoliaChainId = inkSepolia.id;
const inkChainId = ink.id;

/**
 * Ink Sepolia
 */

export const USDT0_INK_SEPOLIA: Token = {
  address: '0x60F50F902b2E91aef7D6c700Eb22599e297fa86F',
  chainId: inkSepoliaChainId,
  tokenDecimals: 6,
  symbol: PRIMARY_QUOTE_SYMBOLS.usdt0,
  icon: TOKEN_ICONS.usdt0,
};

export const KBTC_INK_SEPOLIA: Token = {
  address: '0x48C1dCfD50c2F19f1CF710Dd8e690ae900D0314A',
  chainId: inkSepoliaChainId,
  tokenDecimals: 8,
  symbol: 'kBTC',
  icon: TOKEN_ICONS.kbtc,
};

export const WETH_INK_SEPOLIA: Token = {
  address: '0x5Ebb77b8C8e1E44592eDd0e6702d321527DC5EBA',
  chainId: inkSepoliaChainId,
  tokenDecimals: 18,
  symbol: 'wETH',
  icon: TOKEN_ICONS.weth,
};

export const USDC_INK_SEPOLIA: Token = {
  address: '0x77DC67005C238df90318fF624F2Ab0Fe4800c5f8',
  chainId: inkSepoliaChainId,
  tokenDecimals: 6,
  symbol: 'USDC',
  icon: TOKEN_ICONS.usdc,
};

export const NLP_INK_SEPOLIA: Token = {
  address: '0xC5856516E08d23c07F2aeF1B95B4B8232F90F9c8',
  chainId: inkSepoliaChainId,
  tokenDecimals: 18,
  symbol: NLP_TOKEN_INFO.symbol,
  icon: TOKEN_ICONS.nlp,
};

/**
 * Ink mainnet
 */

export const USDT0_INK: Token = {
  address: '0x0200C29006150606B650577BBE7B6248F58470c1',
  chainId: inkChainId,
  tokenDecimals: 6,
  symbol: PRIMARY_QUOTE_SYMBOLS.usdt0,
  icon: TOKEN_ICONS.usdt0,
};

export const WETH_INK: Token = {
  address: '0x4200000000000000000000000000000000000006',
  chainId: inkChainId,
  tokenDecimals: 18,
  symbol: 'wETH',
  icon: TOKEN_ICONS.weth,
};

export const KBTC_INK: Token = {
  address: '0x73E0C0d45E048D25Fc26Fa3159b0aA04BfA4Db98',
  chainId: inkChainId,
  tokenDecimals: 8,
  symbol: 'kBTC',
  icon: TOKEN_ICONS.kbtc,
};

export const USDC_INK: Token = {
  address: '0x2D270e6886d130D724215A266106e6832161EAEd',
  chainId: inkChainId,
  tokenDecimals: 6,
  symbol: 'USDC',
  icon: TOKEN_ICONS.usdc,
};

export const NLP_INK: Token = {
  address: '0xf9E0aF5E093c6fF7D75983414826462fC4aBE430',
  chainId: inkChainId,
  tokenDecimals: 18,
  symbol: NLP_TOKEN_INFO.symbol,
  icon: TOKEN_ICONS.nlp,
};
