import { BridgeChain } from '@circle-fin/bridge-kit';
import { TOKEN_ICONS } from '@nadohq/react-client';
import { NextImageSrc } from '@nadohq/web-common';
import { DataEnv } from 'common/environment/baseClientEnv';
import { clientEnv } from 'common/environment/clientEnv';
import { get } from 'lodash';
import { Address, Chain } from 'viem';
import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  linea,
  lineaSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  sei,
  seiTestnet,
  sepolia,
  sonic,
  sonicTestnet,
  unichain,
  unichainSepolia,
  worldchain,
  worldchainSepolia,
} from 'viem/chains';

import arbIcon from 'client/modules/collateral/deposit/assets/chains/arb.svg';
import avaxIcon from 'client/modules/collateral/deposit/assets/chains/avax.svg';
import baseIcon from 'client/modules/collateral/deposit/assets/chains/base.svg';
import ethIcon from 'client/modules/collateral/deposit/assets/chains/eth.svg';
import lineaIcon from 'client/modules/collateral/deposit/assets/chains/linea.svg';
import optimismIcon from 'client/modules/collateral/deposit/assets/chains/optimism.svg';
import polygonIcon from 'client/modules/collateral/deposit/assets/chains/polygon.svg';
import seiIcon from 'client/modules/collateral/deposit/assets/chains/sei.svg';
import sonicIcon from 'client/modules/collateral/deposit/assets/chains/sonic.svg';
import unichainIcon from 'client/modules/collateral/deposit/assets/chains/unichain.svg';
import worldchainIcon from 'client/modules/collateral/deposit/assets/chains/worldchain.svg';

/** USDC token info for display purposes. */
export const USDC_TOKEN_INFO = {
  symbol: 'USDC',
  decimals: 6,
  icon: TOKEN_ICONS.usdc,
} as const;

/**
 * Chain configuration for CCTP source chains.
 */
export interface CctpChainConfig {
  /** Circle Bridge Kit SDK chain identifier. */
  sdkChainName: BridgeChain;
  /** Viem chain definition (provides id, name, nativeCurrency, etc.). */
  viemChain: Chain;
  /** Chain icon for display. */
  chainIcon: NextImageSrc;
  /** Native USDC contract address. */
  usdcAddress: Address;
  /** Whether fast transfer is supported. */
  supportsFastTransfer: boolean;
}

/**
 * Mainnet chain configurations for CCTP source chains.
 * @see https://developers.circle.com/cctp/concepts/supported-chains-and-domains
 */
const CCTP_MAINNET_CHAIN_CONFIGS = {
  [mainnet.id]: {
    sdkChainName: BridgeChain.Ethereum,
    viemChain: mainnet,
    chainIcon: ethIcon,
    usdcAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    supportsFastTransfer: true,
  },
  [arbitrum.id]: {
    sdkChainName: BridgeChain.Arbitrum,
    viemChain: arbitrum,
    chainIcon: arbIcon,
    usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    supportsFastTransfer: true,
  },
  [base.id]: {
    sdkChainName: BridgeChain.Base,
    viemChain: base,
    chainIcon: baseIcon,
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    supportsFastTransfer: true,
  },
  [optimism.id]: {
    sdkChainName: BridgeChain.Optimism,
    viemChain: optimism,
    chainIcon: optimismIcon,
    usdcAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    supportsFastTransfer: true,
  },
  [linea.id]: {
    sdkChainName: BridgeChain.Linea,
    viemChain: linea,
    chainIcon: lineaIcon,
    usdcAddress: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
    supportsFastTransfer: true,
  },
  [unichain.id]: {
    sdkChainName: BridgeChain.Unichain,
    viemChain: unichain,
    chainIcon: unichainIcon,
    usdcAddress: '0x078D782b760474a361dDA0AF3839290b0EF57AD6',
    supportsFastTransfer: true,
  },
  [worldchain.id]: {
    sdkChainName: BridgeChain.World_Chain,
    viemChain: worldchain,
    chainIcon: worldchainIcon,
    usdcAddress: '0x79A02482A880bCe3F13E09da970dC34dB4cD24D1',
    supportsFastTransfer: true,
  },
  [polygon.id]: {
    sdkChainName: BridgeChain.Polygon,
    viemChain: polygon,
    chainIcon: polygonIcon,
    usdcAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    supportsFastTransfer: false,
  },
  [avalanche.id]: {
    sdkChainName: BridgeChain.Avalanche,
    viemChain: avalanche,
    chainIcon: avaxIcon,
    usdcAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    supportsFastTransfer: false,
  },
  [sei.id]: {
    sdkChainName: BridgeChain.Sei,
    viemChain: sei,
    chainIcon: seiIcon,
    usdcAddress: '0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392',
    supportsFastTransfer: false,
  },
  [sonic.id]: {
    sdkChainName: BridgeChain.Sonic,
    viemChain: sonic,
    chainIcon: sonicIcon,
    usdcAddress: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
    supportsFastTransfer: false,
  },
} as const satisfies Record<number, CctpChainConfig>;

/**
 * Testnet chain configurations for CCTP source chains.
 * @see https://developers.circle.com/cctp/concepts/supported-chains-and-domains
 */
const CCTP_TESTNET_CHAIN_CONFIGS = {
  [sepolia.id]: {
    sdkChainName: BridgeChain.Ethereum_Sepolia,
    viemChain: sepolia,
    chainIcon: ethIcon,
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    supportsFastTransfer: true,
  },
  [arbitrumSepolia.id]: {
    sdkChainName: BridgeChain.Arbitrum_Sepolia,
    viemChain: arbitrumSepolia,
    chainIcon: arbIcon,
    usdcAddress: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    supportsFastTransfer: true,
  },
  [baseSepolia.id]: {
    sdkChainName: BridgeChain.Base_Sepolia,
    viemChain: baseSepolia,
    chainIcon: baseIcon,
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    supportsFastTransfer: true,
  },
  [optimismSepolia.id]: {
    sdkChainName: BridgeChain.Optimism_Sepolia,
    viemChain: optimismSepolia,
    chainIcon: optimismIcon,
    usdcAddress: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
    supportsFastTransfer: true,
  },
  [lineaSepolia.id]: {
    sdkChainName: BridgeChain.Linea_Sepolia,
    viemChain: lineaSepolia,
    chainIcon: lineaIcon,
    usdcAddress: '0xfece4462d57bd51a6a552365a011b95f0e16d9b7',
    supportsFastTransfer: true,
  },
  [unichainSepolia.id]: {
    sdkChainName: BridgeChain.Unichain_Sepolia,
    viemChain: unichainSepolia,
    chainIcon: unichainIcon,
    usdcAddress: '0x31d0220469e10c4E71834a79b1f276d740d3768F',
    supportsFastTransfer: true,
  },
  [worldchainSepolia.id]: {
    sdkChainName: BridgeChain.World_Chain_Sepolia,
    viemChain: worldchainSepolia,
    chainIcon: worldchainIcon,
    usdcAddress: '0x66145f38cBAC35Ca6F1Dfb4914dF98F1614aeA88',
    supportsFastTransfer: true,
  },
  [polygonAmoy.id]: {
    sdkChainName: BridgeChain.Polygon_Amoy_Testnet,
    viemChain: polygonAmoy,
    chainIcon: polygonIcon,
    usdcAddress: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
    supportsFastTransfer: false,
  },
  [avalancheFuji.id]: {
    sdkChainName: BridgeChain.Avalanche_Fuji,
    viemChain: avalancheFuji,
    chainIcon: avaxIcon,
    usdcAddress: '0x5425890298aed601595a70AB815c96711a31Bc65',
    supportsFastTransfer: false,
  },
  [seiTestnet.id]: {
    sdkChainName: BridgeChain.Sei_Testnet,
    viemChain: seiTestnet,
    chainIcon: seiIcon,
    usdcAddress: '0x4fCF1784B31630811181f670Aea7A7bEF803eaED',
    supportsFastTransfer: false,
  },
  [sonicTestnet.id]: {
    sdkChainName: BridgeChain.Sonic_Testnet,
    viemChain: sonicTestnet,
    chainIcon: sonicIcon,
    usdcAddress: '0x0BA304580ee7c9a980CF72e55f5Ed2E9fd30Bc51',
    supportsFastTransfer: false,
  },
} as const satisfies Record<number, CctpChainConfig>;

type MainnetSourceChainId = keyof typeof CCTP_MAINNET_CHAIN_CONFIGS;
type TestnetSourceChainId = keyof typeof CCTP_TESTNET_CHAIN_CONFIGS;

/** Union of all supported CCTP source chain IDs across environments. */
export type CctpSourceChainId = MainnetSourceChainId | TestnetSourceChainId;

/** CCTP chain configs mapped by data environment. */
const CCTP_CHAIN_CONFIGS_BY_DATA_ENV: Record<
  DataEnv,
  Partial<Record<CctpSourceChainId, CctpChainConfig>>
> = {
  local: CCTP_TESTNET_CHAIN_CONFIGS,
  nadoTestnet: CCTP_TESTNET_CHAIN_CONFIGS,
  nadoMainnet: CCTP_MAINNET_CHAIN_CONFIGS,
};

/** CCTP source chain configs for the active environment. */
export const CCTP_SOURCE_CHAIN_CONFIGS =
  CCTP_CHAIN_CONFIGS_BY_DATA_ENV[clientEnv.base.dataEnv];

/** Resolves the chain config for a given source chain ID. Throws if not found. */
export function getCctpChainConfig(
  sourceChainId: CctpSourceChainId,
): CctpChainConfig {
  const config = get(CCTP_SOURCE_CHAIN_CONFIGS, sourceChainId, undefined);

  if (!config) {
    throw new Error(`No CCTP chain config found for chain ID ${sourceChainId}`);
  }

  return config;
}

/** CCTP destination Bridge Kit SDK chain name by data environment. */
const CCTP_DESTINATION_SDK_CHAIN_NAME_BY_DATA_ENV: Record<
  DataEnv,
  BridgeChain
> = {
  local: BridgeChain.Ink_Testnet,
  nadoTestnet: BridgeChain.Ink_Testnet,
  nadoMainnet: BridgeChain.Ink,
};

/** CCTP destination Bridge Kit SDK chain name for the current environment. */
export const CCTP_DESTINATION_SDK_CHAIN_NAME: BridgeChain =
  CCTP_DESTINATION_SDK_CHAIN_NAME_BY_DATA_ENV[clientEnv.base.dataEnv];
