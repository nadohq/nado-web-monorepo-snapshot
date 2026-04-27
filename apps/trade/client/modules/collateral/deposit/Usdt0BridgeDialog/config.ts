import { TOKEN_ICONS, TokenIconMetadata } from '@nadohq/react-client';
import { NextImageSrc } from '@nadohq/web-common';
import { DataEnv } from 'common/environment/baseClientEnv';
import { clientEnv } from 'common/environment/clientEnv';
import { get } from 'lodash';
import { Address } from 'viem';
import {
  arbitrum,
  Chain,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'viem/chains';

import arbIcon from 'client/modules/collateral/deposit/assets/chains/arb.svg';
import ethIcon from 'client/modules/collateral/deposit/assets/chains/eth.svg';
import optimismIcon from 'client/modules/collateral/deposit/assets/chains/optimism.svg';
import polygonIcon from 'client/modules/collateral/deposit/assets/chains/polygon.svg';

/** USDT decimals (consistent across all chains). */
export const USDT0_DECIMALS = 6;

/** Slippage tolerance for minimum receive amount (1%). */
export const USDT0_SLIPPAGE_FRACTION = 0.01;

/**
 * Source chain configuration for USDT0 bridging.
 * Note: Ethereum uses native USDT with an OFT Adapter (lock/unlock),
 * while other chains use native USDT0 with standard OFT (burn/mint).
 */
export interface Usdt0SourceChainConfig {
  /** Viem chain definition. */
  viemChain: Chain;
  /** Chain icon for display. */
  chainIcon: NextImageSrc;
  /** Token address (USDT on Ethereum, USDT0 on others). */
  tokenAddress: Address;
  /** OFT/OFT Adapter contract address. */
  oftAddress: Address;
  /** Token symbol to display (USDT on Ethereum, USDT0 on others). */
  tokenSymbol: string;
  /** Token icon to display. */
  tokenIcon: TokenIconMetadata;
}

// ---------------------------------------------------------------------------
// Source chain ID types
// ---------------------------------------------------------------------------

/** Union of all supported source chain IDs across environments. */

// ---------------------------------------------------------------------------
// Source chain configs by DataEnv
// ---------------------------------------------------------------------------
const MAINNET_SOURCE_CHAIN_CONFIGS = {
  [mainnet.id]: {
    viemChain: mainnet,
    chainIcon: ethIcon,
    tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Native USDT
    oftAddress: '0x6C96dE32CEa08842dcc4058c14d3aaAD7Fa41dee', // OFT Adapter
    tokenSymbol: 'USDT',
    tokenIcon: TOKEN_ICONS.usdt0,
  },
  [arbitrum.id]: {
    viemChain: arbitrum,
    chainIcon: arbIcon,
    tokenAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT0
    oftAddress: '0x14E4A1B13bf7F943c8ff7C51fb60FA964A298D92', // OFT
    tokenSymbol: 'USDT0',
    tokenIcon: TOKEN_ICONS.usdt0,
  },
  [optimism.id]: {
    viemChain: optimism,
    chainIcon: optimismIcon,
    tokenAddress: '0x01bFF41798a0BcF287b996046Ca68b395DbC1071', // USDT0
    oftAddress: '0xF03b4d9AC1D5d1E7c4cEf54C2A313b9fe051A0aD', // OFT
    tokenSymbol: 'USDT0',
    tokenIcon: TOKEN_ICONS.usdt0,
  },
  [polygon.id]: {
    viemChain: polygon,
    chainIcon: polygonIcon,
    tokenAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT0
    oftAddress: '0x6BA10300f0DC58B7a1e4c0e41f5daBb7D7829e13', // OFT
    tokenSymbol: 'USDT0',
    tokenIcon: TOKEN_ICONS.usdt0,
  },
} as const satisfies Record<number, Usdt0SourceChainConfig>;

const TESTNET_SOURCE_CHAIN_CONFIGS = {
  [sepolia.id]: {
    viemChain: sepolia,
    chainIcon: ethIcon,
    tokenAddress: '0xc4DCC311c028e341fd8602D8eB89c5de94625927', // Mintable test USDT
    oftAddress: '0xc099cD946d5efCC35A99D64E808c1430cEf08126', // OFT
    tokenSymbol: 'USDT',
    tokenIcon: TOKEN_ICONS.usdt0,
  },
} as const satisfies Record<number, Usdt0SourceChainConfig>;

type MainnetSourceChainId = keyof typeof MAINNET_SOURCE_CHAIN_CONFIGS;
type TestnetSourceChainId = keyof typeof TESTNET_SOURCE_CHAIN_CONFIGS;

export type Usdt0SourceChainId = MainnetSourceChainId | TestnetSourceChainId;

/**
 * Source chain configs keyed by DataEnv.
 * `local` reuses the testnet (Sepolia) config.
 */
const USDT0_SOURCE_CHAIN_CONFIGS_BY_DATA_ENV: Record<
  DataEnv,
  Partial<Record<Usdt0SourceChainId, Usdt0SourceChainConfig>>
> = {
  nadoMainnet: MAINNET_SOURCE_CHAIN_CONFIGS,
  nadoTestnet: TESTNET_SOURCE_CHAIN_CONFIGS,
  local: TESTNET_SOURCE_CHAIN_CONFIGS,
};

// ---------------------------------------------------------------------------
// Destination (Ink) LayerZero EID by DataEnv
// ---------------------------------------------------------------------------

/** LayerZero Endpoint IDs for Ink destination chain, keyed by DataEnv. */
const INK_LZ_EID_BY_DATA_ENV: Record<DataEnv, number> = {
  nadoMainnet: 30339,
  // We should be using Ink Testnet (40358) but it's not available, so we use Moderato Testnet for testing
  nadoTestnet: 40444,
  local: 40444,
};

// ---------------------------------------------------------------------------
// Resolved exports for the active environment
// ---------------------------------------------------------------------------

/** Source chain configs for the active environment. */
export const USDT0_SOURCE_CHAIN_CONFIGS =
  USDT0_SOURCE_CHAIN_CONFIGS_BY_DATA_ENV[clientEnv.base.dataEnv];

/** LayerZero Endpoint ID for Ink (destination chain) in the active environment. */
export const INK_LZ_EID = INK_LZ_EID_BY_DATA_ENV[clientEnv.base.dataEnv];

/** LayerZero Scan base URL, keyed by DataEnv. */
const LAYER_ZERO_SCAN_BASE_URL_BY_DATA_ENV: Record<DataEnv, string> = {
  nadoMainnet: 'https://layerzeroscan.com',
  nadoTestnet: 'https://testnet.layerzeroscan.com',
  local: 'https://testnet.layerzeroscan.com',
};

/** LayerZero Scan base URL for the active environment. */
export const LAYER_ZERO_SCAN_BASE_URL =
  LAYER_ZERO_SCAN_BASE_URL_BY_DATA_ENV[clientEnv.base.dataEnv];

/**
 * Gets chain config by chain ID with runtime validation.
 */
export function getUsdt0SourceChainConfig(
  chainId: Usdt0SourceChainId,
): Usdt0SourceChainConfig {
  const config = get(USDT0_SOURCE_CHAIN_CONFIGS, chainId, undefined);

  if (!config) {
    throw new Error(`Chain configuration not found for chain ID ${chainId}`);
  }
  return config;
}
