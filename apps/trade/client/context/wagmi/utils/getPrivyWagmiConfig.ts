import {
  getCreateWagmiConfigParams,
  type WagmiConfigParams,
} from '@nadohq/react-client';
import { createConfig as privyCreateConfig } from '@privy-io/wagmi';
import { Config } from 'wagmi';

/**
 * Creates client required for Privy's wagmi context
 */
export function getPrivyWagmiConfig(params: WagmiConfigParams): Config {
  return privyCreateConfig(
    // reset connectors as Privy does not support custom connectors
    getCreateWagmiConfigParams({ ...params, connectors: [] }),
  );
}
