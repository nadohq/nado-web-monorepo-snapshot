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

export const WQQQX_INK_SEPOLIA: Token = {
  address: '0xc2b2a1c44747d1fcba9bc38745fd38715080ea1d',
  chainId: inkSepoliaChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'QQQx',
  icon: TOKEN_ICONS.qqqx,
};

export const WSPYX_INK_SEPOLIA: Token = {
  address: '0x5e58c20666c8be6696974b38523006d463e2d091',
  chainId: inkSepoliaChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'SPYx',
  icon: TOKEN_ICONS.spyx,
};

export const WAAPLX_INK_SEPOLIA: Token = {
  address: '0x5da76796b9708abca86ea8e3afe7ae6a53e941b2',
  chainId: inkSepoliaChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'AAPLx',
  icon: TOKEN_ICONS.aaplx,
};

export const WAMZNX_INK_SEPOLIA: Token = {
  address: '0x5b7e2b4f444d53e790cd80ac03061a85aa41fd1c',
  chainId: inkSepoliaChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'AMZNx',
  icon: TOKEN_ICONS.amznx,
};

export const WGOOGLX_INK_SEPOLIA: Token = {
  address: '0x3831d053c60208872772e83cbc9c800012684688',
  chainId: inkSepoliaChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'GOOGLx',
  icon: TOKEN_ICONS.googlx,
};

export const WMETAX_INK_SEPOLIA: Token = {
  address: '0xc8d44e2ff9a50ab14d52dfd9ef4b378de299e1c7',
  chainId: inkSepoliaChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'METAx',
  icon: TOKEN_ICONS.metax,
};

export const WMSFTX_INK_SEPOLIA: Token = {
  address: '0x601d9a167e86f03a01c0c891193a5402fdb76270',
  chainId: inkSepoliaChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'MSFTx',
  icon: TOKEN_ICONS.msftx,
};

export const WNVDAX_INK_SEPOLIA: Token = {
  address: '0x02c2414d0b91c2bcc98f1416e5f480ace397f4fc',
  chainId: inkSepoliaChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'NVDAx',
  icon: TOKEN_ICONS.nvdax,
};

export const WTSLAX_INK_SEPOLIA: Token = {
  address: '0x664b1a2f47bcf956759bb76ef8bc3ebab424b304',
  chainId: inkSepoliaChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'TSLAx',
  icon: TOKEN_ICONS.tslax,
};

export const XAUT0_INK_SEPOLIA: Token = {
  address: '0x94B42AF9bAE5663b949536382c856822714e26a3',
  chainId: inkSepoliaChainId,
  tokenDecimals: 6,
  symbol: 'XAUT0',
  icon: TOKEN_ICONS.xaut0,
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

export const WQQQX_INK: Token = {
  address: '0x4c1ae29c159838fc1b224636e28e086eb69101f7',
  chainId: inkChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'QQQx',
  icon: TOKEN_ICONS.qqqx,
};

export const WSPYX_INK: Token = {
  address: '0xe7e553cd128f0011777323a0b44a7b96ea1cb540',
  chainId: inkChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'SPYx',
  icon: TOKEN_ICONS.spyx,
};

export const WAAPLX_INK: Token = {
  address: '0x943bf64d566c32a2bcd41ac92fb63c111cc9de8f',
  chainId: inkChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'AAPLx',
  icon: TOKEN_ICONS.aaplx,
};

export const WAMZNX_INK: Token = {
  address: '0x910cabde3eba7fc1ce64fd14bd680b9f60fa0f90',
  chainId: inkChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'AMZNx',
  icon: TOKEN_ICONS.amznx,
};

export const WGOOGLX_INK: Token = {
  address: '0xf8c5308f80e459bb53d9ebe689854d9cbb2caa6f',
  chainId: inkChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'GOOGLx',
  icon: TOKEN_ICONS.googlx,
};

export const WMETAX_INK: Token = {
  address: '0xe840946ffebcd66b7c4e95095effafadfa0d0e56',
  chainId: inkChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'METAx',
  icon: TOKEN_ICONS.metax,
};

export const WMSFTX_INK: Token = {
  address: '0x166fbe68274b6a47e025f4ba17388c539f1fa1d0',
  chainId: inkChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'MSFTx',
  icon: TOKEN_ICONS.msftx,
};

export const WNVDAX_INK: Token = {
  address: '0xa8ddb5cd96b5222afe198316e9a57caa642850d5',
  chainId: inkChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'NVDAx',
  icon: TOKEN_ICONS.nvdax,
};

export const WTSLAX_INK: Token = {
  address: '0xc3fdbe3a68ee5de461d30415a8165cf9aefe1171',
  chainId: inkChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'TSLAx',
  icon: TOKEN_ICONS.tslax,
};
