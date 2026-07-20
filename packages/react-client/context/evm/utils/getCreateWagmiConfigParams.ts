import { createClient } from 'viem';
import { createConfig, fallback, http } from 'wagmi';
import { WagmiConfigParams } from '../types';

export function getCreateWagmiConfigParams(
  params: WagmiConfigParams,
): Parameters<typeof createConfig>[0] {
  return {
    chains: params.supportedChains,
    connectors: params.connectors,
    client({ chain }) {
      const rpcUrls = params.rpcUrlsByChainId?.[chain.id];
      // When explicit fallback RPCs exist, use only those so we avoid
      // potentially unreliable chain-default RPCs (e.g. Merkle for ETH mainnet).
      const transport = rpcUrls
        ? fallback(rpcUrls.map((url) => http(url)))
        : http();

      return createClient({ chain, transport });
    },
    ssr: true,
  };
}
