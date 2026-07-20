import { Config, createConfig } from 'wagmi';
import { WagmiConfigParams } from '../types';
import { getCreateWagmiConfigParams } from './getCreateWagmiConfigParams';

/**
 * Creates client required for wagmi context
 */
export function getWagmiConfig(params: WagmiConfigParams): Config {
  return createConfig(getCreateWagmiConfigParams(params));
}
