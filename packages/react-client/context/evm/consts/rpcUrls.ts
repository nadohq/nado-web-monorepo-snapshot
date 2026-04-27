import { mainnet, polygon } from 'viem/chains';

/**
 * RPC URLs by chain ID. Used with viem's `fallback` transport
 * so the fastest healthy RPC is automatically preferred via ranking.
 */
export const RPC_URLS_BY_CHAIN_ID: Record<number, string[]> = {
  [mainnet.id]: [
    'https://ethereum-rpc.publicnode.com',
    'https://eth.llamarpc.com',
    'https://cloudflare-eth.com',
    'https://1rpc.io/eth',
  ],
  [polygon.id]: [
    'https://polygon-bor-rpc.publicnode.com',
    'https://polygon.drpc.org',
    'https://1rpc.io/matic',
  ],
};
